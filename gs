controller:
  ingressClassResource:
    name: nginx
    enabled: true
    default: false
    controllerValue: "k8s.io/ingress-nginx"

  ingressClass: nginx

  kind: Deployment  # Explicitly use Deployment

  replicaCount: 2   # Scale to at least 2 for HA across AZs

  service:
    enabled: true
    type: NodePort
    nodePorts:
      http: 30080    # Port used by NLB to forward HTTP (if needed)
      https: 30443   # Port used by NLB to forward HTTPS (TLS terminated at NLB)
    targetPorts:
      http: http
      https: https

  # Optional: Allow using internal IPs as X-Forwarded-For
  config:
    use-forwarded-headers: "true"

  # Optional: Enable readiness probes using the default ports
  healthCheckPath: /healthz
  healthCheckPort: 10254

defaultBackend:
  enabled: true

---

apiVersion: v1
kind: Service
metadata:
  name: nginx-nlb
  namespace: ingress-nginx
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "external"
    service.beta.kubernetes.io/aws-load-balancer-nlb-target-type: "instance"
    service.beta.kubernetes.io/aws-load-balancer-scheme: "internal"
    service.beta.kubernetes.io/aws-load-balancer-ssl-cert: arn:aws:acm:<region>:<account-id>:certificate/<cert-id>
    service.beta.kubernetes.io/aws-load-balancer-ssl-ports: "443"
    service.beta.kubernetes.io/aws-load-balancer-backend-protocol: tcp
    external-dns.alpha.kubernetes.io/hostname: 2048.internal.example.com.
spec:
  type: LoadBalancer
  selector:
    app.kubernetes.io/name: ingress-nginx
  ports:
    - name: https
      port: 443
      targetPort: 30443



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
