#include <linux/build-salt.h>
#include <linux/module.h>
#include <linux/vermagic.h>
#include <linux/compiler.h>

BUILD_SALT;

MODULE_INFO(vermagic, VERMAGIC_STRING);
MODULE_INFO(name, KBUILD_MODNAME);

__visible struct module __this_module
__attribute__((section(".gnu.linkonce.this_module"))) = {
	.name = KBUILD_MODNAME,
	.init = init_module,
#ifdef CONFIG_MODULE_UNLOAD
	.exit = cleanup_module,
#endif
	.arch = MODULE_ARCH_INIT,
};

#ifdef CONFIG_RETPOLINE
MODULE_INFO(retpoline, "Y");
#endif

static const struct modversion_info ____versions[]
__used
__attribute__((section("__versions"))) = {
	{ 0x7ba62dba, "module_layout" },
	{ 0xcfcd9375, "nf_unregister_net_hook" },
	{ 0x6bc3fbc0, "__unregister_chrdev" },
	{ 0xb21e6387, "__register_chrdev" },
	{ 0x634c54f2, "nf_register_net_hook" },
	{ 0x36fbf42c, "init_net" },
	{ 0xa916b694, "strnlen" },
	{ 0x9166fada, "strncpy" },
	{ 0x69acdf38, "memcpy" },
	{ 0x28318305, "snprintf" },
	{ 0xc3aaf0a9, "__put_user_1" },
	{ 0x7aa1756e, "kvfree" },
	{ 0xcbd4898c, "fortify_panic" },
	{ 0x167e7f9d, "__get_user_1" },
	{ 0xd2b09ce5, "__kmalloc" },
	{ 0x7c32d0f0, "printk" },
	{ 0xb35f63, "try_module_get" },
	{ 0xaacc572, "module_put" },
	{ 0xbdfb6dbb, "__fentry__" },
	{ 0xdb7305a1, "__stack_chk_fail" },
	{ 0x9ec6ca96, "ktime_get_real_ts64" },
};

static const char __module_depends[]
__used
__attribute__((section(".modinfo"))) =
"depends=";


MODULE_INFO(srcversion, "B51D3CF876EE3DB12308B93");
