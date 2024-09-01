// utils/index.js
const { Ability, AbilityBuilder } = require('@casl/ability');

function getToken(req) {
  let token = req.headers.authorization
    ? req.headers.authorization.replace('Bearer ', '')
    : null;
  return token && token.length ? token : null;
}

// Kebijakan akses berdasarkan peran pengguna
const policies = {
  guest(user, { can }) {
    can('read', 'Product');
  },
  user(user, { can }) {
    can('view', 'Order');
    can('create', 'Order');
    can('read', 'Order', { user_id: user._id });
    can('update', 'User', { _id: user._id });
    can('read', 'Cart', { user_id: user._id });
    can('update', 'Cart', { user_id: user._id });
    can('create', 'Cart', { user_id: user._id });
    can('view', 'DeliveryAddress');
    can('create', 'DeliveryAddress', { user_id: user._id });
    can('update', 'DeliveryAddress', { user_id: user._id });
    can('delete', 'DeliveryAddress', { user_id: user._id });
    can('read', 'Invoice', { user_id: user._id });
  },
  admin(user, { can }) {
    can('manage', 'all');
  },
};

const policyFor = (user) => {
  const { can, rules } = new AbilityBuilder(Ability);

  if (user && user.role && typeof policies[user.role] === 'function') {
    policies[user.role](user, { can });
  } else {
    policies['guest'](user, { can });
  }

  return new Ability(rules);
};

module.exports = { getToken, policyFor };
