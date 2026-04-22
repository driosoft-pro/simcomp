FROM docker.io/library/haproxy:3.2-alpine

COPY haproxy.cfg /usr/local/etc/haproxy/haproxy.cfg

EXPOSE 8080
EXPOSE 8404

CMD ["haproxy", "-f", "/usr/local/etc/haproxy/haproxy.cfg"]