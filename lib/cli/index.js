var program = require('commander'),
    openstack = require('openstack');

// This is the entry point for Rackspace CLI

var CommandLine = function() {
    var self = this;

    self.app = program;

    self.app
        .version(openstack.version)
        .option('--auth <url>', 'Authenticate against the provided Openstack url and get a token')
        .option('--username <username>', 'Your Openstack account username')
        .option('--password <password>', 'Your Openstack account password')
        .option('--tenantName <tenantName>', 'Your Openstack account tenant name')
        .option('--region [region]', 'Preferred region for API calls')
        .option('--cache', 'Cache the results of the auth call for later use')
        .option('--token <token>', 'Token for making authenticated API calls')
        .option('--getServers', 'Get the instances for the specified region');
};

CommandLine.prototype.run = function() {
    var self = this;

    self.app. parse(process.argv);

    if (self.app.auth) {
        self.authenticate();
    }
    else if (self.app.token) {
        if (self.app.getServers) {
            openstack.createClient({
                loadFromFile: true,
                token: self.app.token,
                region: self.app.region
            }, function(err, client) {

                if (err) {
                    console.dir(err);
                    return;
                }

                client.servers.getServers(function(err, servers) {
                    console.dir(err);
                    console.dir(servers);
                });
            });
        }
    }
};

CommandLine.prototype.authenticate = function() {
    var self = this;

    var cfg = {
        url: self.app.auth
    };

    if (self.app.username && self.app.password) {
        cfg.username = self.app.username;
        cfg.password = self.app.password;
    }
    else {
        throw 'Error';
    }

    if (self.app.tenantName) {
        cfg.tenantName = self.app.tenantName;
    }

    if (self.app.region) {
        cfg.region = self.app.region;
    }

    openstack.createClient(cfg, function(err, client) {
        if (err) {
            console.dir(err);
            return;
        }

        console.log('Successfully authenticated against Rackspace Identity v2.0:\n');
        console.log('Token: ' + client.auth.token.id);

        if (self.app.cache) {
            openstack.core.identity.saveIdentity(client.auth, function(err) {
                console.log(err ? 'Unable to cache authentication results' :
                    'Cached results into: ' + client.auth.token.id + '.json');
                process.exit(err ? 1 : 0);
            });
        }
        else {
            process.exit(0);
        }

    });
};

exports.CommandLine = CommandLine;