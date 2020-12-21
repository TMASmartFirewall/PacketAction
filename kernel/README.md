Here you will find the kernel module itself *tma_module.c* and the compilated file *tma_module.ko*
Also there is a Makefile that let's you compile and insert into the kernel itself. 

In order to insert the module manually:
- insmod tma_module.ko
In order to remove from kernel the module manually:
- rmmod tma_module

Also, you can check the information of the kernel module:
- modinfo tma_module.ko

Finally, you can check the actual modules within the kernel:
- lsmod
And piping so to find tma_module status
- lsmod | grep tma_module
