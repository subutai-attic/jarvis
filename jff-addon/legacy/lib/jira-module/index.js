var self = require("sdk/self");
var url = require("sdk/url").URL;
var logger = console;

const JiraApi = function (protocol, host, port, username, password, apiVersion, verbose, strictSSL, oauth) {
    this.protocol = protocol;
    this.host = host;
    this.port = port;
    this.username = username;
    this.password = password;
    this.apiVersion = apiVersion;

    if (strictSSL === undefined) {
        strictSSL = false;
    }

    this.strictSSL = strictSSL;
    this.request = require("sdk/request").Request;
    this.base64 = require("sdk/base64");


    if (verbose !== true) {
        logger = {
            log: function () {
            }
        };
    }

    this.makeUri = function (pathname, altBase, altApiVersion) {
        var basePath = "/jira/rest/api";
        if (altBase !== undefined) {
            basePath = "/jira" + altBase;
        }

        var apiVersion = this.apiVersion;
        if (altApiVersion !== undefined) {
            apiVersion = altApiVersion;
        }
        const urlPath = this.protocol + "://" +
            this.host + ":" + this.port + basePath + "/" +
            apiVersion + pathname;
        var uri = new url(urlPath);
        return uri.toString();
    };


    this.doRequest = (options, callback, methodType) => {

        if (this.username !== null && this.password !== null) {
            var credentials = "Basic " +
                this.base64.encode(this.username + ":" + this.password, "utf-8");
            logger.log("Encoded credentials: " + credentials);
            if (options.headers) {
                options.headers.push({"Authorization": credentials});
            }
            else {
                options.headers = {"Authorization": credentials};
            }
        }
        options.contentType = "application/json";
        options.onComplete = callback;

        switch (methodType) {
            case "GET":
                this.request(options).get();
                break;
            case "HEAD":
                this.request(options).head();
                break;
            case "POST":
                this.request(options).post();
                break;
            case "PUT":
                this.request(options).put();
                break;
            case "DELETE":
                this.request(options).delete();
                break;
            default:
                throw "Invalid method invocation";
        }
    };
};

JiraApi.prototype.findIssue = function (issueNumber, callback) {
    var options = {
        url: this.makeUri("/issue/" + issueNumber),
        anonymous: this.strictSSL
    };

    this.doRequest(options, function (response) {
        if (response.status === 404) {
            callback("Issue not found or you don't have permissions to view it.");
            return;
        }

        if (response.status !== 200) {
            callback(response.statusText + ": Unable to connect to JIRA during findIssue");
            return;
        }

        if (response.json === undefined) {
            callback("Response body was undefined");
            return;
        }
        logger.log(response.status);
        callback(null, response.json);
    }, "GET");
};

JiraApi.prototype.getUnresolvedIssueCount = function (version, callback) {
    var options = {
        url: this.makeUri("/version/" + version + "/unresolvedIssueCount"),
        anonymous: this.strictSSL
    };

    this.doRequest(options, function (response) {
        if (response.status === 404) {
            callback("Version doesn't exist or doesn't have\
					 permissions to view it");
            return;
        }
        if (response.status !== 200) {
            callback(response.statusText + ": Unable to connect to \
					 JIRA during getting unresolvedIssueCount response");
            return;
        }
        callback(null, response.json);
    }, "GET");
};

JiraApi.prototype.getProject = function (project, callback) {
    var options = {
        url: this.makeUri("/project/" + project),
        anonymous: this.strictSSL
    };

    this.doRequest(options, function (response) {
        if (response.status === 404) {
            callback("Project doesn't exist or doesn't have permissions");
            return;
        }
        if (response.status !== 200) {
            callback(response.statusText + ": Unable to connect to \
					 JIRA during getProject request");
            return;
        }
        callback(null, response.json);
    }, "GET");
};

JiraApi.prototype.issueLink = function (link, callback) {
    var options = {
        url: this.makeUri("/issueLink"),
        anonymous: this.strictSSL,
        content: JSON.stringify(link)
    };

    this.doRequest(options, function (response) {
        if (response.status === 400) {
            callback("can't create the supplied comment: " + response.text);
            return;
        }
        if (response.status === 401) {
            callback("user does not have the link issue permission \
					 for the issue, which will be linked to another issue");
            return;
        }
        if (response.status === 404) {
            callback("issue linking is disabled or it failed to find one of \
					 the issues (issue might exist, but it is not visible \
					 for this user) or it failed to find the specified \
					 issue link type.");
            return;
        }
        if (response.status === 500) {
            callback("an error occurred when creating the issue \
					 link or the comment");
            return;
        }
        if (response.status !== 200) {
            callback(response.statusText + ": Unable to issueLink " +
                response.text);
            return;
        }
        callback(null);
    }, "POST");
};

JiraApi.prototype.getRemoteLinks = function (issueNumber, callback) {
    var options = {
        url: this.makeUri("/issue/" + issueNumber + "/remotelink"),
        anonymous: this.strictSSL
    };

    this.doRequest(options, function (response) {

        if (response.status === 401) {
            callback("calling user is not authenticated");
            return;
        }
        if (response.status === 403) {
            callback("calling user does not have permission to view \
					 the remote issue links, or if issue linking is disabled.");
            return;
        }
        if (response.status === 404) {
            callback("the issue or remote issue link do not exist.");
            return;
        }
        if (response.status !== 200) {
            callback(response.statusText + ": Unable to getRemoteLinks " +
                response.text);
            return;
        }

        callback(null, response.json);
    }, "GET");
};

JiraApi.prototype.createRemoteLink = function (issueNumber, remoteLink,
                                               callback) {
    var options = {
        url: this.makeUri("/issue/" + issueNumber + "/remotelink"),
        anonymous: this.strictSSL,
        content: JSON.stringify(remoteLink)
    };

    this.doRequest(options, function (response) {
        if (response.status === 400) {
            callback(response.statusText + ": input is invalid " +
                response.text);
            return;
        }
        if (response.status === 401) {
            callback("Calling user is not authenticated");
            return;
        }
        if (response.status === 403) {
            callback("calling user does not have permission to \
					 create/update the remote issue link, or if \
					 issue linking is disabled");
            return;
        }
        if (response.status !== 200) {
            callback(response.statusText + ": Error creating remote link " +
                response.text);
            return;
        }
        callback(null, response.json);
    }, "POST");
};

JiraApi.prototype.getVersions = function (project, callback) {
    var options = {
        url: this.makeUri("/project/" + project + "/versions"),
        anonymous: this.strictSSL
    };

    this.doRequest(options, function (response) {
        if (response.status === 404) {
            callback("Project not found or no permissions to view it");
            return;
        }
        if (response.status !== 200) {
            callback(response.statusText + ": Unable to request getVersions");
        }
        callback(null, response.json);
    }, "GET");
};

JiraApi.prototype.createVersion = function (version, callback) {
    var options = {
        url: this.makeUri("/version"),
        anonymous: this.strictSSL,
        content: JSON.stringify(version)
    };

    this.doRequest(options, function (response) {
        if (response.status === 403) {
            callback("Currently authenticated user does not have \
					 permission to edit the version.");
            return;
        }
        if (response.status === 404) {
            callback("Version does not exist or the currently authenticated \
					 user does not have permission to view it");
            return;
        }
        if (response.status !== 201) {
            callback(response.statusText + ": Unable to createVersion " +
                response.text);
            return;
        }
        callback(null, response.text);

    }, "POST");
};

JiraApi.prototype.updateVersion = function (version, callback) {
    var options = {
        url: this.makeUri("/version/" + version.id),
        anonymous: this.strictSSL,
        content: JSON.stringify(version)
    };

    this.doRequest(options, function (response) {
        if (response.status === 404) {
            callback("the version does not exist or the currently \
					 authenticated user does not have permission to view it");
            return;
        }
        if (response.status === 403) {
            callback("currently authenticated user does not have \
					 permission to edit the version");
            return;
        }
        if (response.status !== 200) {
            callback(response.statusText + ": Unable to updateVersion " +
                response.text);
            return;
        }
        callback(null, response.text);
    }, "PUT");
};

JiraApi.prototype.searchJira = function (searchString, optional, callback) {
    optional = optional || {};
    if (Array.isArray(optional)) {
        optional = {fields: optional};
    }

    var options = {
        anonymous: this.stringSSL,
        url: this.makeUri("/search"),
        content: JSON.stringify(
            {
                jql: searchString,
                startAt: optional.startAt || 0,
                maxResults: optional.maxResults || 50,
                fields: optional.fields || ["summary", "status", "assignee", "description"]
            }
        )
    };

    this.doRequest(options, function (response) {
        if (response.status === 400) {
            callback("there is a problem with the JQL query");
            return;
        }

        if (response.status !== 200) {
            callback(response.statusText + ": unable to search Jira " +
                response.text);
            return;
        }
        callback(null, response.json);
    }, "GET");
};

JiraApi.prototype.searchUsers = function (username, startAt,
                                          maxResults, includeActive,
                                          includeInactive, callback) {
    startAt = (startAt !== undefined) ? startAt : 0;
    maxResults = (maxResults !== undefined) ? maxResults : 50;
    includeActive = (includeActive !== undefined) ? includeActive : true;
    includeInactive = (includeInactive !== undefined) ? includeInactive : false;
    var options = {
        url: this.makeUri("user/search?username=" + username +
            "&startAt=" + startAt +
            "&maxResults=" + maxResults +
            "&includeActive=" + includeActive +
            "&includeInactive=" + includeInactive),
        anonymous: this.strictSSL
    };

    this.doRequest(options, function (response) {
        if (response.status === 404) {
            callback("the requested user is not found");
            return;
        }
        if (response.status === 401) {
            callback("the current user is not authenticated");
            return;
        }
        if (response.status !== 200) {
            callback(response.statusText + ": unable to searchUsers " +
                response.text);
            return;
        }
        callback(null, response.text);
    }, "GET");
};

JiraApi.prototype.getUsersIssues = function (username, open, callback) {
    if (username.indexOf("@") > -1) {
        username = username.replace("@", "\\u0040");
    }
    var jql = "assignee=" + username;
    var openText = ' AND status in (Open, "In Progress", "To Do", Reopened)';
    if (open) {
        jql += openText;
    }
    this.searchJira(jql, {}, callback);
};

JiraApi.prototype.addNewIssue = function (issue, callback) {
    var options = {
        url: this.makeUri("/issue"),
        anonymous: this.strictSSL,
        content: JSON.stringify(issue)
    };
    this.doRequest(options, function (response) {
        if (response.status === 400) {
            callback(response.text);
            return;
        }
        if (response.status !== 201 && response.status !== 200) {
            callback(response.statusText + ": unable to addNewIssue " +
                response.text);
            return;
        }
        callback(null, response.text);
    }, "POST");
};

JiraApi.prototype.deleteIssue = function (issueNumber, callback) {
    var options = {
        url: this.makeUri("/issue/" + issueNumber),
        anonymous: this.strictSSL
    };

    this.doRequest(options, function (response) {
        if (response.status === 404) {
            callback("issue does not exist");
            return;
        }
        if (response.status === 403) {
            callback("calling user does not have permission \
					 to delete the issue");
            return;
        }
        if (response.status === 400) {
            callback(response.statusText + "error occured " + response.text);
            return;
        }
        if (response.status === 401) {
            callback("calling user is not authenticated");
            return;
        }
        if (response.status !== 204) {
            callback(response.statusText + ": unable to delete issue " +
                response.text);
            return;
        }
        callback(null);
    }, "DELETE");
};

JiraApi.prototype.updateIssue = function (issueNumber, issueUpdate, callback) {
    var options = {
        content: JSON.stringify(issueUpdate),
        url: this.makeUri("/issue/" + issueNumber),
        anonymous: this.strictSSL
    };

    this.doRequest(options, function (response) {
        if (response.status === 400) {
            callback("requested issue update failed");
            return;
        }
        if (response.status !== 200 && response.status !== 201) {
            callback(response.statusText + ": unable to updateIssue " +
                response.text);
            return;
        }
        callback(null, response.text);
    }, "PUT");
};

JiraApi.prototype.listComponents = function (project, callback) {
    var options = {
        url: this.makeUri("/project/" + project + "/components"),
        anonymous: this.strictSSL
    };

    this.doRequest(options, function (response) {
        if (response.status === 404) {
            callback("project is not found, or the calling user does \
					 not have permission to view it");
            return;
        }
        if (response.status !== 200) {
            callback(response.statusText + ": unable to listComponents" +
                response.text);
            return;
        }
        callback(null, response.text);
    }, "GET");
};

JiraApi.prototype.listTransitions = function (issueId, callback) {
    var options = {
        url: this.makeUri("/issue/" + issueId +
            "/transitions?expand=transitions.fields"),
        anonymous: this.strictSSL
    };

    console.log(options.url);
    this.doRequest(options, function (response) {
        if (response.status === 404) {
            callback("requested issue is not found or the user does not have \
					 permission to view it");
            return;
        }
        if (response.status !== 200) {
            callback(response.statusText + ": unable to listTransitions " +
                response.text);
            return;
        }
        callback(null, response.json);
    }, "GET");
};

JiraApi.prototype.transitionIssue = function (issueId, issueTransition, callback) {
    var options = {
        url: this.makeUri("/issue/" + issueId + "/transitions?expand=transitions.fields"),
        anonymous: this.strictSSL,
        content: JSON.stringify(issueTransition)
    };
    this.doRequest(options, function (response) {
        if (response.status === 404) {
            callback("The issue does not exist or the user does not have permission to view it");
            return;
        }
        if (response.status === 400) {
            callback("there is no transition specified");
            return;
        }
        if (response.status !== 204) {
            callback(response.statusText + ": unable to transition Issue");
            return;
        }
        callback(null, "Success");
    }, "POST");
};

JiraApi.prototype.listProjects = function (callback) {
    var options = {
        url: this.makeUri("/project"),
        anonymous: this.strictSSL
    };
    this.doRequest(options, function (response) {

        if (response.status === 500) {
            callback("error while retrieving the list of projects");
            return;
        }
        if (response.status !== 200) {
            callback(response.statusText + ": unable to listProjects");
            return;
        }
        callback(null, response.text);
    }, "GET");
};

JiraApi.prototype.addComment = function (issueId, comment, callback) {
    var options = {
        anonymous: this.strictSSL,
        url: this.makeUri("/issue/" + issueId + "/comment"),
        content: JSON.stringify(
            {
                "body": comment
            }
        )
    };

    this.doRequest(options, function (response) {
        if (response.status === 400) {
            callback("the input is invalid");
            return;
        }
        if (response.status !== 201) {
            callback(response.statusText + ": unable to addComment");
            return;
        }
        callback(null, response.text);
    }, "POST");
};

JiraApi.prototype.addWorklog = function (issueId, worklog,
                                         newEstimate, callback) {
    var options = {
        anonymous: this.strictSSL,
        url: this.makeUri("/issue/" + issueId +
            (newEstimate ? "?adjustEstimate=new&newEstimate=" +
            newEstimate : "")),
        content: JSON.stringify(worklog)
    };

    this.doRequest(options, function (response) {
        if (response.status === 403) {
            callback("user does not have permission to add the worklog");
            return;
        }
        if (response.status === 400) {
            callback("the input is invalid");
            return;
        }
        if (response.status !== 201) {
            callback(response.statusText + ": unable to addWorklog");
            return;
        }
        callback(null, "Success");
    }, "POST");
};

JiraApi.prototype.getCurrentUser = function (callback) {
    var options = {
        anonymous: this.strictSSL,
        url: this.makeUri("/session", "/rest/auth", "1")
    };

    this.doRequest(options, function (response) {
        if (response.status === 401) {
            callback("caller is not authenticated");
            return;
        }
        if (response.status !== 200) {
            callback(response.statusText + ": unable to getCurrentUser " +
                response.text);
            return;
        }
        callback(null, response.text);
    }, "GET");
};

JiraApi.prototype.startSession = function (credentials, callback) {
    var options = {
        anonymous: this.strictSSL,
        url: this.makeUri("/session", "/rest/auth", "1"),
        content: JSON.stringify(credentials)
    };

    console.log(options.url);

    this.doRequest(options, function (response) {
        if (response.status === 403) {
            callback(" login is denied due to a CAPTCHA requirement, \
					 throtting, or any other reason. In case of a \
					 403 status code it is possible that the supplied \
					 credentials are valid but the user is not allowed to \
					 log in at this point in time");
            return;
        }
        if (response.status === 401) {
            callback("login fails due to invalid credentials");
            return;
        }
        if (response.status !== 200) {
            callback(response.statusText + ": unable to startSession " +
                response.text);
            return;
        }
        callback(null, response.text);
    }, "POST");
};

JiraApi.prototype.destroySession = function (callback) {
    var options = {
        anonymous: this.strictSSL,
        url: this.makeUri("/session", "/rest/auth", '1'),
        headers: {"SetCookie": session}
    };

    console.log(options.url);
    this.doRequest(options, function (response) {
        if (response.status === 401) {
            callback("caller is not authenticated");
            return;
        }
        if (response.status !== 204) {
            callback(response.statusText + ": unable to destroySession " +
                response.text);
            return;
        }
        callback(null, "Success");
    }, "DELETE");
};

exports.JiraApi = JiraApi;
