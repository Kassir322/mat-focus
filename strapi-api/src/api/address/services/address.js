'use strict'

/**
 * address service
 */

const { createCoreService } = require('@strapi/strapi').factories

module.exports = createCoreService('api::address.address')
