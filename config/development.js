'use strict';

    module.exports = {
    	DB: {
    		client: 'mysql',
        		connection: {
        			host     : 'localhost',
            			user     : 'root',
            			password : 'admin1234',
            			database : 'note'
        		},
    		dump: '',
    		debug: false,
             //debug: ['ComQueryPacket']
    	},

	AUTH: {
		TOKEN: {
			KEY: 'vTLk^^znn28t@aYGBj6pvCf$vA2Y33J[',
			SECRET: 'MT2Lq39aG,E4U9w=4#CYoffrJ*K8+3z(xdPYc;dZgQpoXGT(8[@13$%djlz@=Bv'
		},
		facebook: {
			clientID: "382264261959116",
			clientSecret: "4738443b667c74b9b5516888a9642de6",
			callbackURL: "http://localhost:3000/api/0.1/users/facebook/callback"
		},
		linkedin: {
			clientID: "77x3eyzcms42fp",
			clientSecret: "elNqb5Ebny4GB0c5",
			callbackURL: "http://localhost:3000/api/0.1/users/linkedin/callback"
		},
		twitter: {
			consumerKey: "DfDqzafXfvR6fNjCJ3aquQovo",
			consumerSecret: "9SGrQ7i9Fvcvc3D69qiWJiF36RW9Nowwqx0ymEAfa1Sx89Kq6i",
			callbackURL: "http://localhost:3000/api/0.1/users/twitter/callback"
		},
		google: {
			clientID: '1058533247665-kimj1hdauacot7r5ejtsbluh7ae59626.apps.googleusercontent.com',
			clientSecret: 'uldupyDleLKyhjl4VMXVQIfu',
			callbackURL: 'http://localhost:3000/api/0.1/users/google/callback'
		}
	},

	DEBUG: true
};
