# Lambda Function Test Files

This directory contains JSON test files for testing the seven follow-related Lambda functions. Each test file contains multiple test cases that can be used to verify the Lambda functions work correctly.

## Test Files

There are two types of test files:

### Comprehensive Test Files (Multiple Test Cases)
These files contain multiple test cases for each Lambda function:
1. **GetFolloweesLambda-test.json** - Tests for getting a user's followees (people they follow)
2. **GetFollowersLambda-test.json** - Tests for getting a user's followers
3. **GetIsFollowerStatusLambda-test.json** - Tests for checking if one user follows another
4. **GetFollowerCountLambda-test.json** - Tests for getting a user's follower count
5. **GetFolloweeCountLambda-test.json** - Tests for getting a user's followee count
6. **FollowLambda-test.json** - Tests for following a user
7. **UnfollowLambda-test.json** - Tests for unfollowing a user

### Simple Test Files (Single Test Case)
These files contain a single test case that can be used directly with SAM CLI:
1. **GetFolloweesLambda-simple-test.json**
2. **GetFollowersLambda-simple-test.json**
3. **GetIsFollowerStatusLambda-simple-test.json**
4. **GetFollowerCountLambda-simple-test.json**
5. **GetFolloweeCountLambda-simple-test.json**
6. **FollowLambda-simple-test.json**
7. **UnfollowLambda-simple-test.json**

## Test Data

All test files use data from the `FakeData` class, which includes 20 fake users:
- Allen Anderson (@allen)
- Amy Ames (@amy)
- Bob Bobson (@bob)
- Bonnie Beatty (@bonnie)
- Chris Colston (@chris)
- Cindy Coats (@cindy)
- Dan Donaldson (@dan)
- Dee Dempsey (@dee)
- Elliott Enderson (@elliott)
- Elizabeth Engle (@elizabeth)
- Frank Frandson (@frank)
- Fran Franklin (@fran)
- Gary Gilbert (@gary)
- Giovanna Giles (@giovanna)
- Henry Henderson (@henry)
- Helen Hopwell (@helen)
- Igor Isaacson (@igor)
- Isabel Isaacson (@isabel)
- Justin Jones (@justin)
- Jill Johnson (@jill)
- Kent Knudson (@kent)
- Kathy Kunzler (@kathy)

## How to Use

### Using AWS SAM CLI

You can test your Lambda functions locally using AWS SAM CLI. Use the `-simple-test.json` files for quick testing:

```bash
# Test GetFolloweesLambda
sam local invoke getFollowees -e tests/GetFolloweesLambda-simple-test.json

# Test GetFollowersLambda
sam local invoke getFollowers -e tests/GetFollowersLambda-simple-test.json

# Test GetIsFollowerStatusLambda
sam local invoke getIsFollowerStatus -e tests/GetIsFollowerStatusLambda-simple-test.json

# Test GetFollowerCountLambda
sam local invoke getFollowerCount -e tests/GetFollowerCountLambda-simple-test.json

# Test GetFolloweeCountLambda
sam local invoke getFolloweeCount -e tests/GetFolloweeCountLambda-simple-test.json

# Test FollowLambda
sam local invoke follow -e tests/FollowLambda-simple-test.json

# Test UnfollowLambda
sam local invoke unfollow -e tests/UnfollowLambda-simple-test.json
```

For the comprehensive test files with multiple test cases, extract the `request` object from a specific test case and save it to a temporary file, or use it directly in the AWS Lambda console.

### Using Individual Test Cases

Each test file contains multiple test cases. To test a specific case, you can extract the `request` object from a specific test case and use it directly:

```bash
# Example: Test the first test case from GetFolloweesLambda
sam local invoke getFollowees -e tests/GetFolloweesLambda-test.json --event tests/GetFolloweesLambda-test.json
```

### Using AWS Lambda Console

1. Navigate to your Lambda function in the AWS Console
2. Go to the "Test" tab
3. Create a new test event
4. Copy the `request` object from one of the test cases
5. Paste it into the test event JSON editor
6. Run the test

### Expected Response Formats

- **GetFolloweesLambda / GetFollowersLambda**: Returns `PagedUserItemResponse` with `items` (array of UserDto), `hasMore` (boolean), `success`, and `message`
- **GetIsFollowerStatusLambda**: Returns `FollowerStatusResponse` with `isFollower` (boolean), `success`, and `message`
- **GetFollowerCountLambda / GetFolloweeCountLambda**: Returns `CountResponse` with `count` (number), `success`, and `message`
- **FollowLambda / UnfollowLambda**: Returns `FollowAndUnfollowResponse` with `followerCount` (number), `followeeCount` (number), `success`, and `message`

## Notes

- The `token` field in requests should be replaced with actual authentication tokens in production
- Test data uses the fake users from `FakeData` class, which may not reflect actual database state
- For pagination tests, use the `lastItem` from a previous response as the `lastItem` in the next request
- Follower/followee counts are randomly generated (1-10) in the FakeData implementation

