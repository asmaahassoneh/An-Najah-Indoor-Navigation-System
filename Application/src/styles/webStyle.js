export const colors = {
  primary1: "#8f5cff",
  primary2: "#6d3cff",
  bgTop: "#0f172a",
  bgBottom: "#1e293b",

  glass: "rgba(255,255,255,0.06)",
  glass2: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.12)",
  borderSoft: "rgba(255,255,255,0.08)",

  text: "rgba(255,255,255,0.95)",
  textDim: "rgba(255,255,255,0.75)",

  ok: "#4ade80",
  err: "#ff6b6b",
};

export const webUI = {
  pageCenter: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  glassCard: {
    width: "100%",
    maxWidth: 780,
    borderRadius: 26,
    padding: 16,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
  },

  glassCardBig: {
    width: "100%",
    maxWidth: 1000,
    borderRadius: 22,
    padding: 22,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },

  titleXL: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
  },

  sub: {
    color: colors.textDim,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 8,
  },

  input: {
    height: 54,
    borderRadius: 16,
    paddingHorizontal: 16,
    color: "white",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    fontWeight: "700",
  },

  msgOk: { color: colors.ok, fontWeight: "900", textAlign: "center" },
  msgErr: { color: colors.err, fontWeight: "900", textAlign: "center" },
};
