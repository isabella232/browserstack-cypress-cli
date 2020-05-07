'use strict';
const request = require('request');

const config = require("../helpers/config"),
  logger = require("../helpers/logger").winstonLogger,
  Constants = require("../helpers/constants"),
  util = require("../helpers/util");

module.exports = function info(args) {
  return buildInfo(args)
}

function buildInfo(args) {
  let bsConfigPath = process.cwd() + args.cf;

  util.validateBstackJson(bsConfigPath).then(function (bsConfig) {
    util.setUsageReportingFlag(bsConfig, args.disableUsageReporting);

    let buildId = args._[1];

    let options = {
      url: config.buildUrl + buildId,
      method: 'GET',
      auth: {
        user: bsConfig.auth.username,
        password: bsConfig.auth.access_key
      }
    }

    request(options, function (err, resp, body) {
      let message = null;
      let messageType = null;
      let errorCode = null;

      if (err) {
        message = Constants.userMessages.BUILD_INFO_FAILED;
        messageType = Constants.messageTypes.ERROR;
        errorCode = 'api_failed_build_info';

        logger.info(message);
      } else {
        let build = null;
        try {
          build = JSON.parse(body);
        } catch (error) {
          build = null;
        }

        if (resp.statusCode == 299) {
          messageType = Constants.messageTypes.INFO;
          errorCode = "api_deprecated";

          if (build) {
            message = build.message;
            logger.info(message);
          } else {
            message = Constants.userMessages.API_DEPRECATED;
            logger.info(message);
          }
        } else if (resp.statusCode != 200) {
          messageType = Constants.messageTypes.ERROR;
          errorCode = "api_failed_build_info";

          if (build) {
            message = `${
              Constants.userMessages.BUILD_INFO_FAILED
            } with error: \n${JSON.stringify(build, null, 2)}`;
            logger.error(message);
            if (build.message === "Unauthorized") errorCode = "api_auth_failed";
          } else {
            message = Constants.userMessages.BUILD_INFO_FAILED;
            logger.error(message);
          }
        } else {
          messageType = Constants.messageTypes.SUCCESS;
          message = `Build info for build id: \n ${JSON.stringify(
            build,
            null,
            2
          )}`;
          logger.info(message);
        }
      }
      util.sendUsageReport(bsConfig, args, message, messageType, errorCode);
    })
  }).catch(function (err) {
    logger.error(err);
    util.setUsageReportingFlag(null, args.disableUsageReporting);
    util.sendUsageReport(null, args, err.message, Constants.messageTypes.ERROR, util.getErrorCodeFromErr(err));
  })
}
