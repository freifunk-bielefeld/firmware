#!/bin/sh

count() { echo $#; }
strip() { echo "$@"; }
ssort() { strip `echo "$@" | tr ' ' '\n' | sort | tr '\n' ' '`; }
ssort_uniq() { strip `echo "$@" | tr ' ' '\n' | sort | uniq | tr '\n' ' '`; }

#get JSON representation of a settings item
export_json()
{
    file=$1
    section=$2
    echo -n "{ "
    c=0; IFS="
"
    
    for line in `uci -q show $file.$section | tail -n +2`; do
        value=${line##*=}
        name=${line%%=*}
        name=${name##*.}
       
        [ $c -eq 1 ] && echo -n ", " || c=1
       
        echo -n "\"$name\" : \"$value\""
    done
    echo -n " }"
    unset IFS
}

valid_name() {
    tmp=`echo -n "$1" | grep -c '^[0-9a-zA-Z_]*$'`
    [ $tmp -ne 1 ] && {
        echo "(E) tinc: Name '$1' is invalid."
        exit 1
    }
}

valid_entry() {
    tmp=`uci get -q tinc.$1`
    [ "$tmp" != "$2" ] && {
        echo "(E) tinc: Entry '$1' does not exist."
        exit 1
    }
}