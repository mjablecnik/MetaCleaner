FROM structurizr/structurizr:latest AS structurizr

FROM eclipse-temurin:21-jre-alpine

# Install nginx and supervisor
RUN apk add --no-cache nginx supervisor

# Copy Structurizr WAR from official image
COPY --from=structurizr /usr/local/structurizr.war /opt/structurizr/structurizr.war

# Copy config files
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisord.conf

# Create required directories
RUN mkdir -p /run/nginx /usr/local/structurizr

EXPOSE 8080

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
