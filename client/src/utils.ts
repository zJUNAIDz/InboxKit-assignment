export const getLocalIdentity = () => {
  const raw = localStorage.getItem("grid.identity");
  if (raw) return JSON.parse(raw);

  const id = crypto.randomUUID();
  const name = "User-" + id.slice(0, 6);
  const identity = { id, name };
  localStorage.setItem("grid.identity", JSON.stringify(identity));
  return identity;
};