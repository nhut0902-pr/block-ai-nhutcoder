exports.handler = async (event) => {
  try {
    const { password } = JSON.parse(event.body || "{}");
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "12345";

    if (password === ADMIN_PASSWORD) {
      return {
        statusCode: 200,
        headers: {
          "Set-Cookie": "admin_session=true; Path=/; HttpOnly; SameSite=Lax",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ success: true }),
      };
    }

    return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
