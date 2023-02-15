const routes = [
  {
    path: "/",
    component: () => import("src/pages/MainPage.vue"),
  },
  {
    path: "/test",
    component: () => import("src/components/PinchZoom.vue"),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
