export const manifest = {
  screens: {
    scr_0g07ai: { name: "Landing", route: "/", position: { "x": 160, "y": 220 } },
    scr_j4igbn: { name: "Sign Up", route: "/signup", position: { "x": 1560, "y": 220 } },
    scr_qd4s3m: { name: "Login", route: "/login", position: { "x": 2960, "y": 220 } },
    scr_83e1pr: { name: "Dashboard", route: "/dashboard", position: { "x": 160, "y": 2200 } },
    scr_va3bdk: { name: "My Polls", route: "/polls", position: { "x": 1560, "y": 2200 } },
    scr_nbyaoe: { name: "Create Poll", route: "/create", position: { "x": 160, "y": 4180 } },
    scr_22y4uq: { name: "Poll Created / Share", route: "/polls/a82kf91/created", position: { "x": 1560, "y": 4180 } },
    scr_7xwul1: { name: "Public Poll / Voting", route: "/poll/a82kf91", position: { "x": 160, "y": 8140 } },
    scr_o9naw9: { name: "Vote Submitted", route: "/poll/a82kf91", state: { "voted": true }, position: { "x": 1560, "y": 8140 } },
    scr_47kxqq: { name: "Live Results", route: "/polls/a82kf91/results", position: { "x": 2960, "y": 8140 } },
    scr_hfub7p: { name: "Poll Management", route: "/polls/a82kf91", position: { "x": 160, "y": 6160 } },
    scr_zntmtd: { name: "Close Poll Modal", route: "/polls/a82kf91", state: { "closeOpen": true }, position: { "x": 1560, "y": 6160 } },
    scr_ts7m4g: { name: "Closed Poll", route: "/poll/b31xq44", position: { "x": 4360, "y": 8140 } },
    scr_siucam: { name: "Poll Not Found", route: "/poll/missing-link", position: { "x": 160, "y": 10120 } }
  },
  sections: {
    sec_dd9h46: { name: "Authentication", x: 0, y: 0, width: 4320, height: 1180 },
    sec_x31gmd: { name: "Dashboard & Polls", x: 0, y: 1980, width: 2920, height: 1180 },
    sec_0kfciz: { name: "Create Poll", x: 0, y: 3960, width: 2920, height: 1180 },
    sec_th3bx2: { name: "Manage Poll", x: 0, y: 5940, width: 2920, height: 1180 },
    sec_opckdh: { name: "Vote & View Results", x: 0, y: 7920, width: 5720, height: 1180 },
    sec_wkzxvd: { name: "Error States", x: 0, y: 9900, width: 1520, height: 1180 }
  },
  layers: [
  { kind: "section", id: "sec_dd9h46", children: [
    { kind: "screen", id: "scr_0g07ai" },
    { kind: "screen", id: "scr_j4igbn" },
    { kind: "screen", id: "scr_qd4s3m" }]
  },
  { kind: "section", id: "sec_x31gmd", children: [
    { kind: "screen", id: "scr_83e1pr" },
    { kind: "screen", id: "scr_va3bdk" }]
  },
  { kind: "section", id: "sec_0kfciz", children: [
    { kind: "screen", id: "scr_nbyaoe" },
    { kind: "screen", id: "scr_22y4uq" }]
  },
  { kind: "section", id: "sec_th3bx2", children: [
    { kind: "screen", id: "scr_hfub7p" },
    { kind: "screen", id: "scr_zntmtd" }]
  },
  { kind: "section", id: "sec_opckdh", children: [
    { kind: "screen", id: "scr_7xwul1" },
    { kind: "screen", id: "scr_o9naw9" },
    { kind: "screen", id: "scr_47kxqq" },
    { kind: "screen", id: "scr_ts7m4g" }]
  },
  { kind: "section", id: "sec_wkzxvd", children: [
    { kind: "screen", id: "scr_siucam" }]
  }]

};