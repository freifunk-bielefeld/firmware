#!/bin/sh

#Print out local connection data for map creation

echo -n '{ "links" : ['

printLink() { echo -n "{ \"smac\" : \"$(cat /sys/class/net/$3/address)\", \"dmac\" : \"$1\", \"qual\" : $2 }"; }
IFS="
"
nd=0
for entry in $(cat /sys/kernel/debug/batman_adv/bat0/originators |  tr '\t/[]()' ' ' |  awk '{ if($1==$4) print($1, $3, $5) }'); do
  [ $nd -eq 0 ] && nd=1 || echo -n ", "
  IFS=" "
  printLink $entry
done

echo -n '], '
cat /sys/kernel/debug/batman_adv/bat0/transtable_local | tr '\t/[]()' ' ' | awk 'BEGIN{ c=0; } { if($1 == "*" && $4 ~ /^[NW\.]+$/) c++;} END{ printf("\"clientcount\" : %d", c);}'
echo -n '}'
