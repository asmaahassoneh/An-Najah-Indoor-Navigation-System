import { useContext, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import img1 from "../assets/1.jpg";
import img2 from "../assets/2.jpg";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPinned,
  CalendarDays,
  MessageCircle,
  Shield,
  Route,
  Building2,
  ArrowRight,
} from "lucide-react";
import { AuthContext } from "../context/auth.context";
import "../styles/home.css";

export default function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const images = [img1, img2];
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };
  const isStudentOrProfessor =
    user?.role === "student" || user?.role === "professor";

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);
  return (
    <div className="homePage">
      <div className="homeGlow homeGlowOne" />
      <div className="homeGlow homeGlowTwo" />
      <div className="homeNoise" />

      <section className="heroSection">
        <div className="heroSlider">
          <img src={images[current]} alt="campus" className="heroImage" />

          <button className="sliderBtn left" onClick={prevSlide}>
            <ChevronLeft size={20} />
          </button>

          <button className="sliderBtn right" onClick={nextSlide}>
            <ChevronRight size={20} />
          </button>

          <div className="heroOverlay" />
        </div>
        <div className="heroContent">
          <div className="heroBadge">Smart Campus Navigation</div>

          <h1 className="heroTitle">
            Navigate campus faster,
            <br />
            smarter, and easier.
          </h1>

          <p className="heroSubtitle">
            Search rooms, explore lectures and offices, view your schedule,
            message professors, and get guided routes across floors in one
            system.
          </p>

          <div className="heroActions">
            <button
              className="heroBtn heroBtnPrimary"
              onClick={() => navigate("/search")}
            >
              <Search size={18} />
              Search Rooms
            </button>

            {user ? (
              <button
                className="heroBtn heroBtnSecondary"
                onClick={() =>
                  navigate(user.role === "admin" ? "/admin" : "/my-schedule")
                }
              >
                <ArrowRight size={18} />
                {user.role === "admin" ? "Open Dashboard" : "My Schedule"}
              </button>
            ) : (
              <button
                className="heroBtn heroBtnSecondary"
                onClick={() => navigate("/login")}
              >
                <ArrowRight size={18} />
                Login
              </button>
            )}
          </div>

          {user && (
            <div className="heroUserBox">
              <span className="heroUserLabel">Logged in as</span>
              <span className="heroUserName">{user.username}</span>
              <span className="heroUserRole">{user.role}</span>
            </div>
          )}
        </div>

        <div className="heroVisual">
          <div className="heroGlassCard heroVisualMain">
            <div className="heroVisualTop">
              <span className="heroMiniBadge">Live Features</span>
            </div>

            <div className="heroVisualGrid">
              <div className="heroStatCard">
                <MapPinned size={20} />
                <div>
                  <h4>Room Navigation</h4>
                  <p>Navigate to lecture halls, labs, and offices</p>
                </div>
              </div>

              <div className="heroStatCard">
                <CalendarDays size={20} />
                <div>
                  <h4>Schedule Access</h4>
                  <p>Open your lectures and navigate directly</p>
                </div>
              </div>

              <div className="heroStatCard">
                <MessageCircle size={20} />
                <div>
                  <h4>Built-in Chat</h4>
                  <p>Connect students and professors in-app</p>
                </div>
              </div>

              <div className="heroStatCard">
                <Building2 size={20} />
                <div>
                  <h4>Room Search</h4>
                  <p>See room details, lectures, and office owners</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="homeSection">
        <div className="sectionHead">
          <span className="sectionBadge">Features</span>
          <h2 className="sectionTitle">Everything you need in one place</h2>
          <p className="sectionSubtitle">
            Built for a smoother university experience for students, professors,
            and administrators.
          </p>
        </div>

        <div className="featureGrid">
          <div className="featureCard">
            <div className="featureIcon">
              <Route size={22} />
            </div>
            <h3>Multi-floor navigation</h3>
            <p>
              Find routes across floors using mapped nodes, stairs, and
              elevators.
            </p>
          </div>

          <div className="featureCard">
            <div className="featureIcon">
              <Search size={22} />
            </div>
            <h3>Room search</h3>
            <p>
              Search for rooms and view their type, related lectures, or
              assigned professors.
            </p>
          </div>

          <div className="featureCard">
            <div className="featureIcon">
              <CalendarDays size={22} />
            </div>
            <h3>Schedule integration</h3>
            <p>
              Import your schedule and jump directly from a lecture to
              navigation.
            </p>
          </div>

          <div className="featureCard">
            <div className="featureIcon">
              <MessageCircle size={22} />
            </div>
            <h3>Messaging</h3>
            <p>
              Students and professors can communicate directly inside the
              platform.
            </p>
          </div>
        </div>
      </section>

      <section className="homeSection">
        <div className="sectionHead">
          <span className="sectionBadge">Quick Actions</span>
          <h2 className="sectionTitle">Get started quickly</h2>
        </div>

        <div className="quickGrid">
          <button className="quickCard" onClick={() => navigate("/search")}>
            <Search size={22} />
            <div>
              <h3>Search Rooms</h3>
              <p>Find a lecture room, lab, or professor office.</p>
            </div>
          </button>

          {isStudentOrProfessor && (
            <>
              <button
                className="quickCard"
                onClick={() => navigate("/my-schedule")}
              >
                <CalendarDays size={22} />
                <div>
                  <h3>My Schedule</h3>
                  <p>View your lectures and open navigation fast.</p>
                </div>
              </button>

              <button className="quickCard" onClick={() => navigate("/inbox")}>
                <MessageCircle size={22} />
                <div>
                  <h3>Inbox</h3>
                  <p>Open your messages and continue conversations.</p>
                </div>
              </button>
            </>
          )}

          {user?.role === "admin" && (
            <button className="quickCard" onClick={() => navigate("/admin")}>
              <Shield size={22} />
              <div>
                <h3>Admin Dashboard</h3>
                <p>Manage users, rooms, floors, and graph data.</p>
              </div>
            </button>
          )}

          {!user && (
            <>
              <button
                className="quickCard"
                onClick={() => navigate("/register")}
              >
                <ArrowRight size={22} />
                <div>
                  <h3>Create Account</h3>
                  <p>Register and start using the navigation system.</p>
                </div>
              </button>

              <button className="quickCard" onClick={() => navigate("/login")}>
                <Shield size={22} />
                <div>
                  <h3>Login</h3>
                  <p>Access your schedule, messages, and room tools.</p>
                </div>
              </button>
            </>
          )}
        </div>
      </section>

      <section className="homeSection">
        <div className="sectionHead">
          <span className="sectionBadge">How It Works</span>
          <h2 className="sectionTitle">Simple flow, powerful experience</h2>
        </div>

        <div className="stepsGrid">
          <div className="stepCard">
            <div className="stepNumber">01</div>
            <h3>Search for a room</h3>
            <p>
              Enter a room code and view room type, schedule information, or
              office owner details.
            </p>
          </div>

          <div className="stepCard">
            <div className="stepNumber">02</div>
            <h3>Review room info</h3>
            <p>
              Check lectures in that room, professor office assignments, and
              floor details.
            </p>
          </div>

          <div className="stepCard">
            <div className="stepNumber">03</div>
            <h3>Start navigation</h3>
            <p>
              Open the map and get a route to your destination across floors if
              needed.
            </p>
          </div>
        </div>
      </section>

      <section className="homeFooterCard">
        <h2>Navigation System</h2>
        <p>
          A smart university platform for room discovery, navigation,
          scheduling, and communication.
        </p>

        <div className="homeFooterActions">
          <button
            className="heroBtn heroBtnPrimary"
            onClick={() => navigate("/search")}
          >
            <Search size={18} />
            Explore Rooms
          </button>

          {user?.role === "admin" ? (
            <button
              className="heroBtn heroBtnSecondary"
              onClick={() => navigate("/admin")}
            >
              <Shield size={18} />
              Dashboard
            </button>
          ) : user ? (
            <button
              className="heroBtn heroBtnSecondary"
              onClick={() => navigate("/my-schedule")}
            >
              <CalendarDays size={18} />
              My Schedule
            </button>
          ) : (
            <button
              className="heroBtn heroBtnSecondary"
              onClick={() => navigate("/register")}
            >
              <ArrowRight size={18} />
              Get Started
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
