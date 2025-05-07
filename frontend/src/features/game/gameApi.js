export function fetchPlayerById({ id }) {
  return new Promise(async (resolve) => {
    const response = await fetch("http://localhost:5000/players/" + id);
    const data = await response.json();
    resolve({ data });
  });
}

export function createPlayer(id) {
  return new Promise(async (resolve) => {
    const response = await fetch("http://localhost:5000/players/", {
      method: "POST",
      body: JSON.stringify(id),
      headers: { "content-type": "application/json" },
    });
    const data = await response.json();
    resolve({ data });
  });
}
