all: simple-tc

simple-tc: simple-tc.c
	$(CC) -Iinclude $(CPPFLAGS) $(CFLAGS) $(LDFLAGS) -Wall -o $@ $^ $(LDLIBS) -lnl-tiny
