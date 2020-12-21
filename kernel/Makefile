KDIR = /lib/modules/`uname -r`/build
EXTRA_CFLAGS = -g

obj-m        = tma_module.o

kbuild:
	make -C $(KDIR) M=`pwd`

clean:
	 make -C $(KDIR) M=`pwd` clean


test:
	# We put a — in front of the rmmod command to tell make to ignore
	# an error in case the module isn’t loaded.
	-sudo rmmod tma_module
	# Clear the cd log without echo
	sudo dmesg -C
	# Insert the module
	sudo insmod tma_module.ko
	# Display the kernel log
	dmesg