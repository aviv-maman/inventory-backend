const checkIsBoolean = (arg: string | number | undefined) => {
  if (arg === 'active' || arg === 'true' || arg === 1) {
    return true;
  } else if (arg === 'inactive' || arg === 'false' || arg === 0) {
    return false;
  } else {
    return arg;
  }
};

const helpers = {
  checkIsBoolean,
};

export default helpers;
