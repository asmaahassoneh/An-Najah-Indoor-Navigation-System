import { useNavigate } from "react-router-dom";

export default function AdminHome() {
  const navigate = useNavigate();

  return (
    <div className="adminWrap navPage">
      <div className="adminHero">
        <div className="badge">Admin</div>

        <h1 className="adminTitle">Admin Dashboard</h1>
        <p className="adminSub">Choose what you want to manage</p>

        <div className="adminGrid">
          <button
            className="adminCard"
            onClick={() => navigate("/admin/users")}
          >
            <div className="cardIcon">👤</div>
            <div className="cardText">
              <h3>Manage Users</h3>
              <p>Edit usernames, emails, roles, room codes</p>
            </div>
            <span className="cardArrow">→</span>
          </button>

          <button
            className="adminCard"
            onClick={() => navigate("/admin/rooms")}
          >
            <div className="cardIcon">🏫</div>
            <div className="cardText">
              <h3>Manage Rooms</h3>
              <p>Create, update, delete room codes and types</p>
            </div>
            <span className="cardArrow">→</span>
          </button>
          <button
            className="adminCard"
            onClick={() => navigate("/admin/floors")}
          >
            <div className="cardIcon">🗺️</div>
            <div className="cardText">
              <h3>Manage Floors</h3>
              <p>Add floor maps, faculty, image size</p>
            </div>
            <span className="cardArrow">→</span>
          </button>
          <button
            className="adminCard"
            onClick={() => navigate("/admin/graph")}
          >
            <div className="cardIcon">🧭</div>
            <div className="cardText">
              <h3>Build Navigation Graph</h3>
              <p>Add nodes and connect paths on floor maps</p>
            </div>
            <span className="cardArrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
