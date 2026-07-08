export const getAvatarUrl = (userObj) => {
  if (userObj?.avatar) {
    return userObj.avatar;
  }
  const name = userObj?.name || 'User';
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundType=gradientLinear&fontSize=45`;
};
