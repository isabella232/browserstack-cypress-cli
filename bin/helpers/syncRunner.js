'use strict';
const Config = require("./config"),
  logger = require("./logger").syncCliLogger,
  Constants = require("./constants"),
  utils = require("./utils"),
  request = require('request'),
  syncSpecsLogs = require('./sync/syncSpecsLogs'),
  specDetails = require('./sync/failedSpecsDetails'),
  { table, getBorderCharacters } = require('table'),
  chalk = require('chalk');

exports.pollBuildStatus = (bsConfig, buildId) => {
  logBuildDetails().then((data) => {
    return syncSpecsLogs.printSpecsStatus(bsConfig, buildId);
  }).then((data) => {
    printSpecsRunSummary();
  }).then((data) => {
    return specDetails.failedSpecsDetails(data);
  }).then((successExitCode) => {
    return resolveExitCode(successExitCode); // exit code 0
  }).catch((nonZeroExitCode) => {
    return resolveExitCode(nonZeroExitCode); // exit code 1
  }).finally(() => {
    logger.info(Constants.userMessages.BUILD_REPORT_MESSAGE);
    logger.info(`${Config.dashboardUrl}${buildId}`);
  });
};

let logBuildDetails = () => {

};

let printSpecsStatus = () => {

};

let printSpecsRunSummary = () => {

};

let resolveExitCode = (exitCode) => {
  return new Promise((resolve, _reject) => { resolve(exitCode) });
};