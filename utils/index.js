const { Ability, AbilityBuilder } = require('@casl/ability');

// Function to get token from request headers
function getToken(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  return token.length ? token : null;
}

// Access policies based on user roles
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

// Function to create policy for a given user
const policyFor = (user) => {
  const { can, rules } = new AbilityBuilder(Ability);

  if (user && user.role && typeof policies[user.role] === 'function') {
    policies[user.role](user, { can });
  } else {
    console.warn(`Unknown role: ${user ? user.role : 'undefined'}. Falling back to 'guest' role.`);
    policies['guest'](user, { can });
  }

  return new Ability(rules);
};

module.exports = { getToken, policyFor };
