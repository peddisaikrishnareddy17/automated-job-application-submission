const GenericApply = require('./generic');

const handlers = {
    arbeitnow: GenericApply,
    remoteok: GenericApply,
    adzuna: GenericApply,
    usajobs: GenericApply,
    greenhouse: GenericApply
};

const getPortalHandler = (portalName) => {
    return handlers[portalName.toLowerCase()] || null;
};

module.exports = { getPortalHandler };

