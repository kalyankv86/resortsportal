// PM2 process definition for the CWETR Next.js frontend.
//   pm2 start deploy/pm2/ecosystem.config.js
//   pm2 save && pm2 startup   (run the printed command once, as root)

module.exports = {
  apps: [
    {
      name: "cwetr-frontend",
      cwd: "/opt/resorts/frontend/current",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 2,
      exec_mode: "cluster",
      max_memory_restart: "600M",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      error_file: "/opt/resorts/logs/frontend-error.log",
      out_file: "/opt/resorts/logs/frontend-out.log",
      time: true,
    },
  ],
};
