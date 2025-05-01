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
    kubernetes.io/ingress.class: "nginx"  # change if you're using another class
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    external-dns.alpha.kubernetes.io/hostname: "2048.example.com"
spec:
  tls:
    - hosts:
        - 2048.example.com
      secretName: game-2048-tls
  rules:
    - host: 2048.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: game-2048
                port:
                  number: 80
