List<User> user = [SELECT Id FROM User WHERE Name = 'User User' LIMIT 1];
user[0].UserPermissionsLiveAgentUser = true;
update user;