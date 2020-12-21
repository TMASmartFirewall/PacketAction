#!/bin/bash

echo "Hi, let's burn this pc by compiling"
sudo npm run build

if [ $? -ne 0 ];then
    echo "Error when compiling"
    exit $?
fi

sudo rm -r /var/www/html/test/*
sudo cp -r build/* /var/www/html/test/