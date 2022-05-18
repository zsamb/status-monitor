#!/usr/bin/env bash
read -p "Enter port: " PORT;
pid=$(lsof -i:${PORT} -t); 
kill $pid;