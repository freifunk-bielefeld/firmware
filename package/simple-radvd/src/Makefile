all: simple-radvd

simple-radvd: simple-radvd.c
	$(CC) $(CPPFLAGS) $(CFLAGS) $(LDFLAGS) -Wall -o $@ $^ $(LDLIBS) -lrt
