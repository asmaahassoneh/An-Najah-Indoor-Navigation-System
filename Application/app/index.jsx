import { useCallback, useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";

import Screen from "../src/components/Screen";
import AppNavbar from "../src/components/AppNavbar";
import GlowBackground from "../src/components/GlowBackground";
import { AuthContext } from "../src/context/auth.context";

const HERO_HEIGHT = 280;

export default function Home() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  const images = [require("../assets/1.jpg"), require("../assets/2.jpg")];
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const isStudentOrProfessor =
    user?.role === "student" || user?.role === "professor";

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <Screen padded={false}>
      <GlowBackground />
      <AppNavbar />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.heroSlider}>
            <Image source={images[current]} style={styles.heroImage} />

            <View style={styles.heroOverlay} />

            <Pressable
              style={[styles.sliderBtn, styles.leftBtn]}
              onPress={prevSlide}
            >
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </Pressable>

            <Pressable
              style={[styles.sliderBtn, styles.rightBtn]}
              onPress={nextSlide}
            >
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </Pressable>
          </View>

          <View style={styles.heroContent}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Smart Campus Navigation</Text>
            </View>

            <Text style={styles.heroTitle}>
              Navigate campus faster,{"\n"}smarter, and easier.
            </Text>

            <Text style={styles.heroSubtitle}>
              Search rooms, explore lectures and offices, view your schedule,
              message professors, and get guided routes across floors in one
              system.
            </Text>

            <View style={styles.heroActions}>
              <Pressable
                style={[styles.heroBtn, styles.heroBtnPrimary]}
                onPress={() => router.push("/search")}
              >
                <Feather name="search" size={18} color="#fff" />
                <Text style={styles.heroBtnText}>Search Rooms</Text>
              </Pressable>

              {user ? (
                <Pressable
                  style={[styles.heroBtn, styles.heroBtnSecondary]}
                  onPress={() =>
                    router.push(
                      user.role === "admin" ? "/admin" : "/my-schedule",
                    )
                  }
                >
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                  <Text style={styles.heroBtnText}>
                    {user.role === "admin" ? "Open Dashboard" : "My Schedule"}
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.heroBtn, styles.heroBtnSecondary]}
                  onPress={() => router.push("/login")}
                >
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                  <Text style={styles.heroBtnText}>Login</Text>
                </Pressable>
              )}
            </View>

            {user && (
              <View style={styles.heroUserBox}>
                <Text style={styles.heroUserLabel}>Logged in as</Text>
                <Text style={styles.heroUserName}>{user.username}</Text>
                <View style={styles.rolePill}>
                  <Text style={styles.rolePillText}>{user.role}</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.heroVisual}>
            <View style={styles.heroGlassCard}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Live Features</Text>
              </View>

              <FeatureMiniCard
                icon={
                  <Ionicons name="location-outline" size={20} color="#fff" />
                }
                title="Room Navigation"
                text="Navigate to lecture halls, labs, and offices"
              />

              <FeatureMiniCard
                icon={
                  <MaterialCommunityIcons
                    name="calendar-month-outline"
                    size={20}
                    color="#fff"
                  />
                }
                title="Schedule Access"
                text="Open your lectures and navigate directly"
              />

              <FeatureMiniCard
                icon={
                  <Ionicons name="chatbubble-outline" size={20} color="#fff" />
                }
                title="Built-in Chat"
                text="Connect students and professors in-app"
              />

              <FeatureMiniCard
                icon={
                  <Ionicons name="business-outline" size={20} color="#fff" />
                }
                title="Room Search"
                text="See room details, lectures, and office owners"
              />
            </View>
          </View>
        </View>

        <SectionHeader
          badge="Features"
          title="Everything you need in one place"
          subtitle="Built for a smoother university experience for students, professors, and administrators."
        />

        <View style={styles.gridOneCol}>
          <FeatureCard
            icon={
              <MaterialCommunityIcons name="routes" size={22} color="#fff" />
            }
            title="Multi-floor navigation"
            text="Find routes across floors using mapped nodes, stairs, and elevators."
          />

          <FeatureCard
            icon={<Feather name="search" size={22} color="#fff" />}
            title="Room search"
            text="Search for rooms and view their type, related lectures, or assigned professors."
          />

          <FeatureCard
            icon={
              <MaterialCommunityIcons
                name="calendar-month-outline"
                size={22}
                color="#fff"
              />
            }
            title="Schedule integration"
            text="Import your schedule and jump directly from a lecture to navigation."
          />

          <FeatureCard
            icon={<Ionicons name="chatbubble-outline" size={22} color="#fff" />}
            title="Messaging"
            text="Students and professors can communicate directly inside the platform."
          />
        </View>

        <SectionHeader badge="Quick Actions" title="Get started quickly" />

        <View style={styles.gridOneCol}>
          <QuickCard
            icon={<Feather name="search" size={22} color="#fff" />}
            title="Search Rooms"
            text="Find a lecture room, lab, or professor office."
            onPress={() => router.push("/search")}
          />

          {isStudentOrProfessor && (
            <>
              <QuickCard
                icon={
                  <MaterialCommunityIcons
                    name="calendar-month-outline"
                    size={22}
                    color="#fff"
                  />
                }
                title="My Schedule"
                text="View your lectures and open navigation fast."
                onPress={() => router.push("/my-schedule")}
              />

              <QuickCard
                icon={
                  <Ionicons name="chatbubble-outline" size={22} color="#fff" />
                }
                title="Inbox"
                text="Open your messages and continue conversations."
                onPress={() => router.push("/inbox")}
              />
            </>
          )}

          {user?.role === "admin" && (
            <QuickCard
              icon={
                <Ionicons
                  name="shield-checkmark-outline"
                  size={22}
                  color="#fff"
                />
              }
              title="Admin Dashboard"
              text="Manage users, rooms, floors, and graph data."
              onPress={() => router.push("/admin")}
            />
          )}

          {!user && (
            <>
              <QuickCard
                icon={<Ionicons name="arrow-forward" size={22} color="#fff" />}
                title="Create Account"
                text="Register and start using the navigation system."
                onPress={() => router.push("/register")}
              />

              <QuickCard
                icon={
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={22}
                    color="#fff"
                  />
                }
                title="Login"
                text="Access your schedule, messages, and room tools."
                onPress={() => router.push("/login")}
              />
            </>
          )}
        </View>

        <SectionHeader
          badge="How It Works"
          title="Simple flow, powerful experience"
        />

        <View style={styles.gridOneCol}>
          <StepCard
            number="01"
            title="Search for a room"
            text="Enter a room code and view room type, schedule information, or office owner details."
          />

          <StepCard
            number="02"
            title="Review room info"
            text="Check lectures in that room, professor office assignments, and floor details."
          />

          <StepCard
            number="03"
            title="Start navigation"
            text="Open the map and get a route to your destination across floors if needed."
          />
        </View>

        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>Navigation System</Text>
          <Text style={styles.footerText}>
            A smart university platform for room discovery, navigation,
            scheduling, and communication.
          </Text>

          <View style={styles.heroActions}>
            <Pressable
              style={[styles.heroBtn, styles.heroBtnPrimary]}
              onPress={() => router.push("/search")}
            >
              <Feather name="search" size={18} color="#fff" />
              <Text style={styles.heroBtnText}>Explore Rooms</Text>
            </Pressable>

            {user?.role === "admin" ? (
              <Pressable
                style={[styles.heroBtn, styles.heroBtnSecondary]}
                onPress={() => router.push("/admin")}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color="#fff"
                />
                <Text style={styles.heroBtnText}>Dashboard</Text>
              </Pressable>
            ) : user ? (
              <Pressable
                style={[styles.heroBtn, styles.heroBtnSecondary]}
                onPress={() => router.push("/my-schedule")}
              >
                <MaterialCommunityIcons
                  name="calendar-month-outline"
                  size={18}
                  color="#fff"
                />
                <Text style={styles.heroBtnText}>My Schedule</Text>
              </Pressable>
            ) : (
              <Pressable
                style={[styles.heroBtn, styles.heroBtnSecondary]}
                onPress={() => router.push("/register")}
              >
                <Ionicons name="arrow-forward" size={18} color="#fff" />
                <Text style={styles.heroBtnText}>Get Started</Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function SectionHeader({ badge, title, subtitle }) {
  return (
    <View style={styles.sectionHead}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {!!subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );
}

function FeatureMiniCard({ icon, title, text }) {
  return (
    <View style={styles.heroStatCard}>
      <View style={styles.featureMiniIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.heroStatTitle}>{title}</Text>
        <Text style={styles.heroStatText}>{text}</Text>
      </View>
    </View>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureIcon}>{icon}</View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardText}>{text}</Text>
    </View>
  );
}

function QuickCard({ icon, title, text, onPress }) {
  return (
    <Pressable style={styles.quickCard} onPress={onPress}>
      <View style={styles.quickIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardText}>{text}</Text>
      </View>
    </Pressable>
  );
}

function StepCard({ number, title, text }) {
  return (
    <View style={styles.stepCard}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingTop: 100,
    paddingBottom: 40,
    paddingHorizontal: 16,
    gap: 22,
  },

  heroSection: {
    gap: 18,
  },

  heroSlider: {
    width: "100%",
    height: HERO_HEIGHT,
    borderRadius: 26,
    overflow: "hidden",
    position: "relative",
    top: "-100px",
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  heroOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(10,14,28,0.45)",
  },

  sliderBtn: {
    position: "absolute",
    top: "50%",
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    zIndex: 2,
  },

  leftBtn: {
    left: 14,
  },

  rightBtn: {
    right: 14,
  },

  heroContent: {
    marginTop: 2,
  },

  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    marginBottom: 14,
  },

  badgeText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontWeight: "800",
  },

  heroTitle: {
    color: "rgba(255,255,255,0.98)",
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900",
  },

  heroSubtitle: {
    marginTop: 16,
    color: "rgba(255,255,255,0.76)",
    fontSize: 15.5,
    lineHeight: 26,
  },

  heroActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 22,
  },

  heroBtn: {
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  heroBtnPrimary: {
    backgroundColor: "#8f5cff",
  },

  heroBtnSecondary: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
  },

  heroBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },

  heroUserBox: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
  },

  heroUserLabel: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 14,
  },

  heroUserName: {
    color: "rgba(255,255,255,0.96)",
    fontWeight: "800",
  },

  rolePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(143,92,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(143,92,255,0.26)",
  },

  rolePillText: {
    color: "#efe8ff",
    fontWeight: "700",
    textTransform: "capitalize",
    fontSize: 12,
  },

  heroVisual: {
    marginTop: 4,
  },

  heroGlassCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 28,
    padding: 18,
    gap: 12,
  },

  heroStatCard: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },

  featureMiniIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  heroStatTitle: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
    marginBottom: 4,
  },

  heroStatText: {
    color: "rgba(255,255,255,0.72)",
    lineHeight: 21,
    fontSize: 13.5,
  },

  sectionHead: {
    marginTop: 4,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
  },

  sectionSubtitle: {
    marginTop: 10,
    color: "rgba(255,255,255,0.74)",
    lineHeight: 24,
    fontSize: 14.5,
  },

  gridOneCol: {
    gap: 14,
  },

  featureCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 22,
    padding: 18,
  },

  featureIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    backgroundColor: "rgba(143,92,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  quickCard: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 22,
    padding: 18,
  },

  quickIcon: {
    marginTop: 2,
  },

  stepCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 24,
    padding: 18,
  },

  stepNumber: {
    alignSelf: "flex-start",
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(143,92,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(143,92,255,0.22)",
  },

  stepNumberText: {
    color: "#efe8ff",
    fontWeight: "800",
    fontSize: 12,
  },

  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },

  cardText: {
    color: "rgba(255,255,255,0.72)",
    lineHeight: 24,
    fontSize: 14,
  },

  footerCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 30,
    padding: 22,
    alignItems: "center",
    marginTop: 6,
  },

  footerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
  },

  footerText: {
    marginTop: 10,
    color: "rgba(255,255,255,0.74)",
    textAlign: "center",
    lineHeight: 25,
    fontSize: 14.5,
  },
});
