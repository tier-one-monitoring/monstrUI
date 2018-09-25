# Copy all static files to apache directory
cp -rf plugins dist bootstrap admin /var/www/t1services.jinr.ru/static/.

# Copy templates to Django directory
cp -rf templates /opt/monstrWeb/.

service httpd restart
