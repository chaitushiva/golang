---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: game-2048
  labels:
    app: game-2048
spec:
  replicas: 1
  selector:
    matchLabels:
      app: game-2048
  template:
    metadata:
      labels:
        app: game-2048
    spec:
      containers:
        - name: game-2048
          image: alexwhen/docker-2048
          ports:
            - containerPort: 80

---
apiVersion: v1
kind: Service
metadata:
  name: game-2048
spec:
  selector:
    app: game-2048
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: game-2048
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/backend-protocol: "HTTP"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    external-dns.alpha.kubernetes.io/hostname: game.example.com
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  rules:
    - host: game.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: game-2048
                port:
                  number: 80
  tls:
    - hosts:
        - game.example.com
      secretName: game-2048-tls
