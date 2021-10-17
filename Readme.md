Flow map for files:
![](images/readme.png)


bot_main.js: initialize bot and seperate and channel commands into commands.js

commands.js: distributing all commands to specific files

Classes.js: all shared static variables, functions, and classes are stored in this file.

filesystem.js: 

	embeded_ff14(): send a discord embeded message(cards) to discord user. Using loadstone.find_character(). Currently only being called by find_character() and card().

	create_user(): create a new discord user and record in the database. ~create [discord_id] [discord_username] [privilege] [lodestone].

	link_ff14(): link ff14 character to a discord user and record in the database. The same character can be linked by multiple user but not the same user.
		~link [discord id] [character name](fname lname) [server]. ~link [discord id] [lodestone id]. ~link [lodestone id]

	card(): show discord user infomation and also show its ff14 info if he/she has character linked. ~whoami

	find_character(): show the designated character infomation by using embeded_ff14(). ~find [characterFname characterLname] [server/datacenter/server_region]. ~find lodestone_id

	check_rank(): check user info in database, if not insert into it. check if asked character is linked with user, if not link it with user.
				Using fflogs.check_rank() in fflogs_analysis.js. ~fflogs [character_firstName] [character_lastName] [combatName] [server_name].

fflogs_analysis.js:	

	check_rank(): check the fflogs of character. ~fflogs [character_firstName] [character_lastName] [combatName] [server_name].

act_auto_fflogs.js: (new features!!)
	ACT(Advanced Combat Tracker) with plugin Triggernometry script would output player join party message into discord channel, and this file would parse that message to automately check player's logs from fflogs

loadstone.js: 
	find_character(): find character info by two get requesting to XIVAPI. 
						1): With character_name and optional server_name to get lodestone_ID of that character.
						2): With only URL to get lodestone infomation, private key and lodestone ID has been added to URL before function called.
					function accepts calls from other function from current/other files and direct discord message.


