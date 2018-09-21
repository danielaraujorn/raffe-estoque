import constantes from "./constantes";
export const requestApi = async (method, url, data) => {
  console.log(method, url, data);
  try {
    const response = await fetch(
      constantes.hostname + constantes.versao + url,
      {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(data)
      }
    );
    const content = await response
      .text()
      .then(text => (text ? JSON.parse(text) : {}));
    return { content, status: response.status };
  } catch (err) {
    console.log(err);
    return err;
  }
};
