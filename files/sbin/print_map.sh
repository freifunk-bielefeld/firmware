#!/bin/sh

#Print out local connection data for map creation

echo -n '{ "macs" : ['

nd=0
for ifname in `batctl if | awk -F"[ :]+" '{ if($2=="active") print($1)}' `; do
  [ $nd -eq 0 ] && nd=1 || echo -n ", "
  echo -n "\"$(cat /sys/class/net/$ifname/address)\""
done

echo -n '], "links" : {'

printLink() { echo -n "\"$(cat /sys/class/net/$3/address)\" : { \"mac\" : \"$1\", \"qual\" : $2 }"; }
IFS="
"
nd=0
for entry in $(cat /sys/kernel/debug/batman_adv/bat0/originators |  tr '\t/[]()' ' ' |  awk '{ if($1==$4) print($1, $3, $5) }'); do
  [ $nd -eq 0 ] && nd=1 || echo -n ", "
  IFS=" "
  printLink $entry
done

echo -n '}, '
cat /sys/kernel/debug/batman_adv/bat0/transtable_local | tr '\t/[]()' ' ' | awk 'BEGIN{ c=0; } { if($1 == "*" && $3 == "-1") c++;} END{ printf("\"clientcount\" : %d", c);}'
echo -n '}'
