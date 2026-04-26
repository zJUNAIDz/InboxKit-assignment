import { getLocalIdentity } from "./utils";

const Nav = () => {
  return (
    <header className="app-nav">
      <p className="nav-eyebrow">Realtime board Grid</p>
      <h1 className="nav-title">{getLocalIdentity().name}</h1>
    </header>
  );
};

export default Nav;