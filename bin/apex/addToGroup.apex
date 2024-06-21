List<User> user = [SELECT Id FROM User WHERE Name = 'User User' LIMIT 1];
List<Group> groups = [SELECT Id FROM Group WHERE Type = 'Regular' AND DeveloperName = 'test' LIMIT 1];
insert new GroupMember(UserOrGroupId = user[0].Id, GroupId = groups[0].Id);