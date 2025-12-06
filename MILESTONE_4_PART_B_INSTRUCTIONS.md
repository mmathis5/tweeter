# Project Milestone 4 Part B: Scalable Status Processing - Step-by-Step Instructions

## Overview
This milestone requires implementing scalable status processing using SQS queues for asynchronous feed updates, creating a database population script, and writing automated tests.

---

## Part 1: Database Population Script

### Step 1.1: Create the Population Script Directory
1. Create a new directory: `tweeter-server/scripts/`
2. Create a file: `tweeter-server/scripts/populateDatabase.ts`

### Step 1.2: Implement the Population Script
The script should:
- Create ~10,000 test users
- Add follow relationships so at least one user has 10,000+ followers
- Use DynamoDB batch write operations (max 25 items per batch)
- Handle password hashing (use bcryptjs, same as UserService)
- Optionally use the same profile picture for all users (or no profile picture)

**Key Implementation Notes:**
- Use `BatchWriteCommand` from `@aws-sdk/lib-dynamodb`
- Batch writes are limited to 25 items per request
- For 10,000 users: 10,000 / 25 = 400 batches
- For 10,000 follows: 10,000 / 25 = 400 batches
- Use `Promise.all()` with batching to write multiple batches concurrently (but not too many to avoid throttling)
- Create users first, then create follow relationships
- Designate one user (e.g., `@testUser1`) to have 10,000 followers

### Step 1.3: Create a Script Runner
1. Create `tweeter-server/scripts/runPopulateDatabase.ts` or add npm script to `package.json`
2. Ensure the script can be run with: `npm run populate-db` or `ts-node scripts/populateDatabase.ts`

### Step 1.4: Temporarily Increase WCU Settings
**Before running the script:**
1. Go to AWS Console → DynamoDB
2. Find the `Users` table
3. Edit capacity settings:
   - Change from "On-demand" to "Provisioned" (or increase if already provisioned)
   - Set Write Capacity Units (WCU) to 200
4. Repeat for the `follow` table (set WCU to 200)

**After running the script:**
1. Change both tables back to original WCU settings (1 or 5, or back to On-demand if that was original)

---

## Part 2: Implement SQS Queues for Feed Updates

### Step 2.1: Add SQS Queues to template.yaml
In `tweeter-server/template.yaml`, under the "SQS Queues" section (around line 288), add:

```yaml
  # First Queue: Receives status post notifications
  PostStatusQueue:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: PostStatusQueue
      VisibilityTimeout: 300  # 5 minutes (adjust based on Lambda timeout)

  # Second Queue: Receives batches of follower aliases to update
  UpdateFeedQueue:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: UpdateFeedQueue
      VisibilityTimeout: 300  # 5 minutes
```

### Step 2.2: Create SQS Client Utility
1. Create `tweeter-server/src/model/dao/util/SQSClient.ts`
2. Import and configure `SQSClient` from `@aws-sdk/client-sqs`
3. Export a default SQS client instance (similar to DynamoDBClient.ts)

### Step 2.3: Modify StatusService.postStatus()
In `tweeter-server/src/model/service/StatusService.ts`:

**Current behavior:** Synchronously gets all followers and updates all feeds

**New behavior:**
1. Post status to Stories table (keep this synchronous)
2. Instead of getting followers and updating feeds synchronously:
   - Send a message to `PostStatusQueue` containing:
     - Author alias
     - Status data (post, timestamp, user info, segments)
3. Return immediately (this ensures < 1 second perceived latency)

**Implementation:**
- Create a method `sendPostStatusMessage()` that uses SQS `SendMessageCommand`
- The message body should be JSON containing all status information needed to update feeds
- Use the queue URL (you can get it from environment variable or construct it)

### Step 2.4: Create First Lambda Function (PostStatusQueue Handler)
1. Create `tweeter-server/src/lambda/feed/PostStatusQueueHandler.ts`
2. This Lambda will:
   - Be triggered by messages from `PostStatusQueue`
   - Extract author alias and status data from the message
   - Get all followers of the author (paginate through all followers)
   - Batch followers into groups (e.g., 25 per batch, or adjust based on your design)
   - Send batches of follower aliases to `UpdateFeedQueue`

**Key Points:**
- Use `getAllFollowerAliases()` logic (similar to StatusService)
- Batch followers (e.g., 25 follower aliases per message to UpdateFeedQueue)
- For 10,000 followers: 10,000 / 25 = 400 messages to UpdateFeedQueue
- Each message to UpdateFeedQueue should contain:
  - Status data
  - Array of follower aliases (up to 25)

### Step 2.5: Create Second Lambda Function (UpdateFeedQueue Handler)
1. Create `tweeter-server/src/lambda/feed/UpdateFeedQueueHandler.ts`
2. This Lambda will:
   - Be triggered by messages from `UpdateFeedQueue`
   - Extract status data and follower aliases from the message
   - Use `BatchWriteCommand` to write status to all followers' feeds in one batch
   - Handle up to 25 feed updates per batch (DynamoDB batch write limit)

**Key Points:**
- Use `BatchWriteCommand` from `@aws-sdk/lib-dynamodb`
- Each batch can contain up to 25 feed items
- If a message contains 25 follower aliases, write all 25 in one batch operation
- Handle unprocessed items (retry logic if needed)

### Step 2.6: Add Lambda Functions to template.yaml
Under "SQS Queue Lambda Functions" section (around line 513):

```yaml
  PostStatusQueueHandler:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: PostStatusQueueHandler
      Handler: lambda/feed/PostStatusQueueHandler.handler
      Policies: *commonPolicies
      Timeout: 300  # 5 minutes (adjust as needed)
      Events:
        SQSTrigger:
          Type: SQS
          Properties:
            Queue: !GetAtt PostStatusQueue.Arn
            BatchSize: 1  # Process one message at a time
            Enabled: true

  UpdateFeedQueueHandler:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: UpdateFeedQueueHandler
      Handler: lambda/feed/UpdateFeedQueueHandler.handler
      Policies: *commonPolicies
      Timeout: 300  # 5 minutes
      Events:
        SQSTrigger:
          Type: SQS
          Properties:
            Queue: !GetAtt UpdateFeedQueue.Arn
            BatchSize: 1  # Process one message at a time
            Enabled: true
```

### Step 2.7: Update StatusService Dependencies
- Add SQS client import
- Add method to send messages to PostStatusQueue
- Remove or comment out the synchronous feed update code (lines 50-58 in current StatusService.ts)
- Keep the `postStatus()` call to Stories table

---

## Part 3: Configure Feed Table with WCU Limits

### Step 3.1: Add Feed Table to template.yaml
Under "DynamoDB Tables" section (around line 530), add:

```yaml
  feedTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: Feed
      AttributeDefinitions:
        - AttributeName: userAlias
          AttributeType: S
        - AttributeName: timestamp
          AttributeType: N
      KeySchema:
        - AttributeName: userAlias
          KeyType: HASH
        - AttributeName: timestamp
          KeyType: RANGE
      BillingMode: PROVISIONED
      ProvisionedThroughput:
        ReadCapacityUnits: 5
        WriteCapacityUnits: 100  # Maximum 100 WCU as per requirements
```

**Note:** The Feed table should have:
- Partition Key: `userAlias` (String)
- Sort Key: `timestamp` (Number, descending)
- WCU: 100 (maximum allowed)

### Step 3.2: Verify Stories Table Configuration
Ensure `Stories` table is also defined in template.yaml with appropriate settings.

---

## Part 4: Update DynamoDBStatusDAO for Batch Operations

### Step 4.1: Add Batch Write Method
In `tweeter-server/src/model/dao/dynamoDB/DynamoDBStatusDAO.ts`:

Add a new method:
```typescript
async batchWriteToFeed(feedItems: Array<{userAlias: string, status: Status}>): Promise<void>
```

This method should:
- Use `BatchWriteCommand` from `@aws-sdk/lib-dynamodb`
- Accept an array of feed items (up to 25)
- Convert each status to the feed item format
- Handle unprocessed items (may need to retry)

### Step 4.2: Update addStatusToFeed (Optional)
You may want to keep `addStatusToFeed()` for single updates, or replace it with batch operations only.

---

## Part 5: Automated Testing

### Step 5.1: Create Integration Test File
1. Create `tweeter-web/test/integration/PostStatusIntegration.test.ts`
2. Use jest and ts-mockito (as specified)

### Step 5.2: Implement Test Steps
The test should:

1. **Login a user:**
   - Use `UserService.login()` or directly access `ServerFacade`
   - Store the returned `[User, AuthToken]`

2. **Post a status:**
   - Call `PostStatusPresenter.submitPost()` with:
     - Event (mock React.MouseEvent)
     - Current user
     - Auth token
     - Post text (e.g., "Test status post")

3. **Verify "Successfully Posted!" message:**
   - Mock the view
   - Verify `displayInfoMessage("Status posted!", 2000)` was called
   - Or verify the success message was displayed

4. **Retrieve user's story:**
   - Use `StatusService.loadMoreStoryItems()` or directly access `ServerFacade`
   - Get the first page of story items

5. **Verify status details:**
   - Check that the new status appears in the story
   - Verify:
     - Post text matches
     - User matches
     - Timestamp is recent (within last few seconds)
     - All status details are correct

### Step 5.3: Test Structure Example
```typescript
describe("PostStatus Integration Test", () => {
  it("should post a status and verify it appears in story", async () => {
    // 1. Login
    // 2. Post status
    // 3. Verify success message
    // 4. Retrieve story
    // 5. Verify status in story
  });
});
```

### Step 5.4: Handle Old Tests
- Option 1: Delete old tests that relied on FakeData
- Option 2: Comment them out
- Option 3: Add `.skip` or mark them as ignored in jest

Files that may need attention:
- `tweeter-web/test/api/StatusService.test.ts`
- `tweeter-web/test/api/ServerFacade.test.ts`
- Any other tests using FakeData

---

## Part 6: Environment Variables and Configuration

### Step 6.1: Add Queue URLs to Lambda Environment
In `template.yaml`, for Lambda functions that need queue URLs:

```yaml
Environment:
  Variables:
    POST_STATUS_QUEUE_URL: !Ref PostStatusQueue
    UPDATE_FEED_QUEUE_URL: !Ref UpdateFeedQueue
```

Add this to:
- `postStatus` Lambda (needs POST_STATUS_QUEUE_URL)
- `PostStatusQueueHandler` Lambda (needs UPDATE_FEED_QUEUE_URL)
- `UpdateFeedQueueHandler` Lambda (may need Feed table name)

### Step 6.2: Update Lambda Handlers
- Read queue URLs from `process.env`
- Read table names from environment or constants

---

## Part 7: Testing and Verification

### Step 7.1: Build and Deploy
1. Run `npm run build` in `tweeter-server/`
2. Run `sam build`
3. Run `sam deploy`

### Step 7.2: Test Status Posting
1. Post a status from a user with few followers (< 10)
2. Verify it appears in followers' feeds quickly
3. Check CloudWatch logs for queue processing

### Step 7.3: Test with High Follower Count
1. Use the user with 10,000 followers (from population script)
2. Post a status
3. Verify:
   - Status post returns in < 1 second
   - Status appears in followers' feeds within 120 seconds
   - Feed pages load in < 1 second

### Step 7.4: Monitor Queue Processing
- Check SQS queue metrics in AWS Console
- Verify messages are being processed
- Check for any dead letter queue messages (you may want to add DLQs)

### Step 7.5: Run Integration Test
1. Run: `npm test` in `tweeter-web/`
2. Verify the new integration test passes
3. Verify old tests are skipped/ignored if they fail

---

## Part 8: Performance Optimization Notes

### Step 8.1: Batch Size Considerations
- DynamoDB batch write: max 25 items
- SQS message batching: consider how many follower aliases per message
- Balance between:
  - Number of messages to UpdateFeedQueue (more messages = more Lambda invocations)
  - Items per batch write (more items = fewer writes but larger messages)

### Step 8.2: WCU Calculation
- For 10,000 followers: need to write 10,000 feed items
- With 100 WCU: can write 100 items per second
- 10,000 items / 100 WCU = 100 seconds (meets 120 second requirement)
- With batching (25 items per batch): 10,000 / 25 = 400 batches
- 400 batches / 100 WCU = 4 seconds of write time (but network/processing overhead)

### Step 8.3: Error Handling
- Add Dead Letter Queues (DLQ) for both SQS queues
- Handle unprocessed items in batch writes (retry logic)
- Add CloudWatch alarms for queue depth

---

## Part 9: Additional Considerations

### Step 9.1: Message Format
Design the SQS message format carefully:

**PostStatusQueue message:**
```json
{
  "authorAlias": "@user",
  "status": {
    "post": "Status text",
    "timestamp": 1234567890,
    "user": {...},
    "segments": [...]
  }
}
```

**UpdateFeedQueue message:**
```json
{
  "status": {...},
  "followerAliases": ["@follower1", "@follower2", ...]
}
```

### Step 9.2: Lambda Timeout Settings
- PostStatusQueueHandler: May need longer timeout if processing 10K followers
- UpdateFeedQueueHandler: Should be faster (just batch writes)
- Consider increasing memory if needed for better performance

### Step 9.3: Concurrency
- SQS triggers Lambda with default concurrency
- May need to adjust Lambda reserved concurrency if processing too many messages simultaneously
- Consider queue visibility timeout vs Lambda timeout

---

## Summary Checklist

- [ ] Create database population script (~10K users, 10K+ followers for one user)
- [ ] Temporarily increase WCU for Users and follow tables to 200
- [ ] Run population script
- [ ] Decrease WCU back to original settings
- [ ] Add two SQS queues to template.yaml
- [ ] Create SQS client utility
- [ ] Modify StatusService to send message to PostStatusQueue instead of synchronous updates
- [ ] Create PostStatusQueueHandler Lambda
- [ ] Create UpdateFeedQueueHandler Lambda
- [ ] Add both Lambda functions to template.yaml with SQS triggers
- [ ] Add Feed table to template.yaml with 100 WCU limit
- [ ] Add batch write method to DynamoDBStatusDAO
- [ ] Create integration test for status posting
- [ ] Handle/delete old tests that use FakeData
- [ ] Add environment variables for queue URLs
- [ ] Build, deploy, and test
- [ ] Verify performance requirements are met

---

## Important Notes

1. **DO NOT change existing code unnecessarily** - only modify what's needed for the new functionality
2. **Test incrementally** - test each component as you build it
3. **Monitor costs** - SQS and Lambda invocations can add up
4. **Error handling** - Make sure to handle failures gracefully
5. **Logging** - Add appropriate logging for debugging queue processing

---

## References

- DynamoDB Batch Write: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/batch-operation.html
- SQS with Lambda: https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
- DynamoDB Provisioned Capacity: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ProvisionedThroughput.html
- Jest Testing: https://jestjs.io/
- ts-mockito: https://github.com/NagRock/ts-mockito

