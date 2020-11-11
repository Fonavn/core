export default () => {
  const sendGrid = {
    apiKey: process.env.SENDGRID_API_KEY,
  };

  return Object.freeze({ sendGrid });
};
