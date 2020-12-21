#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/netfilter.h>
#include <linux/netfilter_ipv4.h>

#include <linux/ioctl.h>

#include <linux/fs.h>
#include <asm/uaccess.h>

#include <linux/ktime.h>


#include <linux/ip.h>
#include <linux/tcp.h>
#include <linux/udp.h>
#include <linux/fs.h>

#include <linux/module.h>
#include <linux/skbuff.h>          
#include <linux/init.h>
#include <net/sock.h>
#include <linux/inet.h>
#include <linux/ip.h>             
#include <linux/kernel.h> 
#include <linux/netfilter.h>
#include <uapi/linux/netfilter_ipv4.h> 



MODULE_LICENSE("GPL");
MODULE_AUTHOR("MMiquel");
MODULE_DESCRIPTION("Traffic kernel module");
MODULE_VERSION("0.01");

#define DEVICE_NAME "tma_module"
#define EXAMPLE_MSG "No data\n"
#define MSG_BUFFER_LEN 2048

char BUFFER[1024];
// "atenea.upc.edu,uoc.edu,ub.edu,urv.cat,pornhub.com,http://www.ghibli.jp/,info.cern.ch";
u_char BANNED_DOMAINS_EXAMPLE[] = "";

u_char BANNED_DOMAINS[MSG_BUFFER_LEN];

static u_int MODE_OF_OPERATION = 2; // 1 -> BANNED | 2 -> MSG_BUFFER
static u_char* READ_POINTER;

u_char FILTER = 0x6;
u_char FILTER_READ = 0x0;

/* Prototypes for device functions */
static int device_open(struct inode *, struct file *); 
static int device_release(struct inode *, struct file *);
static ssize_t device_read(struct file *, char *, size_t, loff_t *);
static ssize_t device_write(struct file *, const char *, size_t, loff_t *);
static int major_num;
static int device_open_count = 0;
static char msg_buffer[MSG_BUFFER_LEN];
static char *msg_ptr;



u_char* split_lines_http(u_char* payload, u_int length){
    u_char *res = NULL, *it;
    for (it = payload; it < (payload + length) - 1; it++){
        if (*it == '\r' && *(it + 1) == '\n'){
            res = it - 1;
            break;
        }
    }
    return res;
}

u_char* analyzeHttpHeader(u_char* payload, u_int max_length){
    // Search for : delimiter
    u_int ctx;
    for (ctx = 0; ctx < max_length; ++ctx){
        if (*(payload + ctx) == ':'){
            return payload + ctx;
        }
    }
    return NULL;
}


void print_uchar_array(u_char* arr, u_int length){
    u_int ctx;
    printk(KERN_CONT "[");
    for (ctx = 0; ctx < length; ++ctx){
        printk(KERN_CONT "%c", *(ctx + arr));
    }
    printk(KERN_CONT "]");

}

int compareStrings(u_char* s1, u_char *s2, u_int length){
    //printk("Init comparison\n");
    u_int it;
    for (it = 0; it < length; ++it){
       // printk(KERN_CONT "[%u] [%u]\n", *s1, *s2);
        if (*s1 != *s2){
        //    printk("End comparison\n");
            return 0;
        }
        s1++;
        s2++;
    }
    //printk("End comparison\n");
    return 1;
}


int processHeaders(u_char* payload, u_int max_length, void *priv, struct sk_buff *skb, const struct nf_hook_state *state){
    u_char* line_start = payload;
    u_int accum_length = 0;

    while (line_start < (payload + max_length)){
        u_char* act_line = split_lines_http(line_start, max_length - accum_length );
        if (act_line == NULL){
            printk("NULL\n");
            break;
        }
        printk("Whole header size: %u\n", (act_line - line_start));

        u_char* split = analyzeHttpHeader(line_start, act_line - line_start);
        if (split == NULL){
            break;
        }
        //else printk("OK\n");

        u_int header_size = (split - line_start) - 1;
        u_char* header_name = kmalloc(sizeof(u_char) * header_size, GFP_KERNEL);
        

        u_char* itx;
        u_char* aux;
        aux = header_name;
        for (itx = line_start + 1; itx < split; ++itx){
            *aux = *itx;
            ++aux;
        }

        printk(KERN_CONT "%u - Header name: \n", header_size);
        print_uchar_array(header_name, split - line_start - 1 );


        u_int value_size = (act_line - split) - 1;
        u_char* value = kmalloc(sizeof(u_char) * value_size, GFP_KERNEL);        
        aux = value;
        for (itx = split + 2; itx <= act_line; ++itx){
            *aux = *itx;
            ++aux;
        }

        printk("%u - Header response: \n", value_size);       
        printk(KERN_CONT "Header value: ");
        print_uchar_array(value, value_size );

        // All validations

        u_char* begin_itx = BANNED_DOMAINS;
        while (*begin_itx != '\0'){
            printk("ITER\n");
            u_char* delimiter_pos;
            for (delimiter_pos = begin_itx; *(delimiter_pos) != ','; ++delimiter_pos){
                if(*(delimiter_pos) == '\0') break;
            }

            u_int dom_length = delimiter_pos - begin_itx;
            // Compare string with given
            u_char* tmp = value;
            u_int comparisonStrings = compareStrings(begin_itx, value, dom_length );
            if (comparisonStrings == 1){
                printk("HTTP Match!\n");
                struct iphdr *ip_header;
                ip_header = (struct iphdr *)skb_network_header(skb);
                u32 saddr = ntohl(ip_header->saddr);


                printk("Inside report branch\n");
                unsigned char bytes[4];
                bytes[0] = saddr & 0xFF;
                bytes[1] = (saddr >> 8) & 0xFF;
                bytes[2] = (saddr >> 16) & 0xFF;
                bytes[3] = (saddr >> 24) & 0xFF;  
                struct timespec ts;
                getnstimeofday(&ts);

                printk("Domain length: %u\n", dom_length);
                u_int activatedHTTPFilter = (FILTER >> 2) & 0x1;

                u_int written_bytes = 0;
                written_bytes += snprintf(msg_buffer, 1024, "{\"src_ip\":\"%d.%d.%d.%d\"", bytes[3], bytes[2], bytes[1], bytes[0]);
                written_bytes += snprintf(msg_buffer + written_bytes, 1024 - written_bytes, ",\"host\":\"");
                //written_bytes += snprintf(msg_buffer + written_bytes, dom_length + 1 , tmp);
                memcpy(msg_buffer + written_bytes, tmp, dom_length);

                printk("Written atm: %u\n", written_bytes);
                written_bytes += snprintf(msg_buffer + written_bytes + dom_length , 1024 - written_bytes , "\",\"method\":\"HTTP\",\"ts\":%u,\"action\":%u}\n", ts.tv_sec, activatedHTTPFilter);
                printk("Written atm: %u\n", written_bytes);

                kvfree(header_name);
                kvfree(value);

                msg_ptr = msg_buffer;

                // Mirem si tenim el filtre HTTPS activat 
               
                return activatedHTTPFilter ? NF_DROP : NF_ACCEPT;


                //return NF_DROP;
            }

            begin_itx = delimiter_pos + 1;
        }

        kvfree(header_name);
        kvfree(value);

        accum_length += (act_line - line_start);
        line_start = act_line + 2;
    }
    printk("OUT\n");
    return NF_ACCEPT;
    
}

int processUdpPacket(void *priv, struct sk_buff *skb, const struct nf_hook_state *state){
    printk("Hello from processUdpPacket\n");
   
    unsigned char *user_data, *it, *tail;
    struct udphdr *udph;
    udph = udp_hdr(skb); 
    user_data = (unsigned char *)((unsigned char *)udph + sizeof(struct udphdr));
    tail = skb_tail_pointer(skb);

    u_int udp_payload_length = tail - user_data;

    printk("Difference: %u\n", udp_payload_length);

    

    // Offset: 12 Bytes

    // Line is like atenea.upc.edu -> 6atenea3upc3edu0
    u_char* end_line;

    for (end_line = user_data + 12; *end_line != 0x0; ++end_line);

    printk("Difference line: %u\n", end_line - (user_data + 12));

    

    u_char* itx;
    for (itx = user_data + 12; itx < end_line; ++itx){
        printk(KERN_CONT "[%u]", *itx);
    }
    printk("\n");

    

    // Process name
    u_int hostname_length = 0;
    u_char* n = user_data + 12;
    while (*n != 0x0){
        hostname_length += (*n + 1);
        //printk("Actual value n = %u\n", *n);
        n += (*n + 1);
    }
    hostname_length-=1;

    printk("Length of request: %u\n", hostname_length);    

    u_char* domain = kmalloc(hostname_length, GFP_KERNEL);
    
    u_char* aux;
    u_char* cp = domain;

    u_int first_value = *(user_data + 12); // 3gcc4hpm33com0 -> 3
    
    for (aux = user_data + 12 + 1; aux < end_line; ++aux){
        

        if (first_value == 0x00){
            *cp = '.';
            printk("(.)\n");
            first_value = *aux;
        }
        else {
            first_value -= 1;
            printk("(%u)\n", *aux);
            *cp = *aux;
            }        
        ++cp;
    }
    //return NF_ACCEPT;
    

    u_int it2;
    for (it2 = 0; it2 < hostname_length; ++it2){
        printk(KERN_CONT "[%c]", *(domain + it2));
    }
    printk("End of parsing DNS method\n");

    //return NF_ACCEPT;
    // Check atenea.upc.edu

    u_char* begin_itx = BANNED_DOMAINS;
    while (*begin_itx != '\0'){
        printk("ITER\n");
        u_char* delimiter_pos;
        for (delimiter_pos = begin_itx; *(delimiter_pos) != ','; ++delimiter_pos){
            if(*(delimiter_pos) == '\0') break;
        }

        u_int dom_length = delimiter_pos - begin_itx;
        // Compare string with given
        u_char* tmp = domain;
        u_int comparisonStrings = compareStrings(begin_itx, domain, dom_length );
        if (comparisonStrings == 1){
            printk("DNS Match!\n");
            struct iphdr *ip_header;
            ip_header = (struct iphdr *)skb_network_header(skb);
            u32 saddr = ntohl(ip_header->saddr);


            printk("Inside report branch\n");
            unsigned char bytes[4];
            bytes[0] = saddr & 0xFF;
            bytes[1] = (saddr >> 8) & 0xFF;
            bytes[2] = (saddr >> 16) & 0xFF;
            bytes[3] = (saddr >> 24) & 0xFF;  
            struct timespec ts;
            getnstimeofday(&ts);

            printk("Domain length: %u\n", dom_length);

            u_int activatedDNSFilter = FILTER & 0x1;

            u_int written_bytes = 0;
            written_bytes += snprintf(msg_buffer, 1024, "{\"src_ip\":\"%d.%d.%d.%d\"", bytes[3], bytes[2], bytes[1], bytes[0]);
            written_bytes += snprintf(msg_buffer + written_bytes, 1024 - written_bytes, ",\"host\":\"");
            //written_bytes += snprintf(msg_buffer + written_bytes, dom_length + 1 , tmp);
            memcpy(msg_buffer + written_bytes, tmp, dom_length);

            printk("Written atm: %u\n", written_bytes);
            written_bytes += snprintf(msg_buffer + written_bytes + dom_length , 1024 - written_bytes , "\",\"method\":\"DNS\",\"ts\":%u,\"action\":%u}\n", ts.tv_sec,  activatedDNSFilter);
            printk("Written atm: %u\n", written_bytes);

            msg_ptr = msg_buffer;

            // Mirem si tenim el filtre DNS activat 
            
            return activatedDNSFilter ? NF_DROP : NF_ACCEPT;
        }

        begin_itx = delimiter_pos + 1;
    }


    //int dns_blocked = hostname_length == 14 && compareStrings(domain, "atenea.upc.edu", 14 );


    // Free memory  
    kvfree(domain);

    return NF_ACCEPT;
}


int parseExtensions(u_char* starter, u_int extensions_length, void *priv, struct sk_buff *skb, const struct nf_hook_state *state){
    u_char* latest_position = starter + extensions_length;
    u_char* it;

    it = starter;
    while (it < latest_position){
        uint16_t type = (((*(it) & 0xF0) >> 4) * ( 16 * 16 * 16)) + (((*(it) & 0x0F)) * ( 16 * 16))\
                          + (((*(it + 1) & 0xF0) >> 4) * (16)) + (((*(it + 1) & 0x0F)));

        u_int16_t length = (((*(it + 2) & 0xF0) >> 4) * ( 16 * 16 * 16)) + (((*(it + 2) & 0x0F)) * ( 16 * 16))\
                          + (((*(it + 3) & 0xF0) >> 4) * (16)) + (((*(it + 3) & 0x0F)));

        //printk("Test: %u\n", *it);

        printk("parseExtensions  - Type -> %u\n", type);
        printk("parseExtensions - Length: %u\n", length);
        //break;

        if (type == 0){
            u_int server_name_list_length = (((*(it + 4) & 0xF0) >> 4) * ( 16 * 16 * 16)) + (((*(it + 4) & 0x0F)) * ( 16 * 16))\
                          + (((*(it + 5) & 0xF0) >> 4) * (16)) + (((*(it + 5) & 0x0F)));
            u_int server_name_type = *(it + 6);
            u_int server_name_length = (((*(it + 7) & 0xF0) >> 4) * ( 16 * 16 * 16)) + (((*(it + 7) & 0x0F)) * ( 16 * 16))\
                          + (((*(it + 8) & 0xF0) >> 4) * (16)) + (((*(it + 8) & 0x0F)));

            printk("Has SNI extension: ");
            u_int itx;
            for(itx = 0; itx < server_name_length; ++itx){
                printk(KERN_CONT "%c", *(it + 9 + itx));
            }
            printk("\n");
            u_char* begin_itx = BANNED_DOMAINS;
            while (*begin_itx != '\0'){
                printk("ITER\n");
                u_char* delimiter_pos;
                for (delimiter_pos = begin_itx; *(delimiter_pos) != ','; ++delimiter_pos){
                    if(*(delimiter_pos) == '\0') break;
                }

                u_int dom_length = delimiter_pos - begin_itx;
                // Compare string with given
                u_char* tmp = it + 9;
                u_int comparisonStrings = compareStrings(begin_itx, it + 9, dom_length );
                if (comparisonStrings == 1){
                    printk("DNS Match!\n");
                    struct iphdr *ip_header;
                    ip_header = (struct iphdr *)skb_network_header(skb);
                    u32 saddr = ntohl(ip_header->saddr);


                    printk("Inside report branch\n");
                    unsigned char bytes[4];
                    bytes[0] = saddr & 0xFF;
                    bytes[1] = (saddr >> 8) & 0xFF;
                    bytes[2] = (saddr >> 16) & 0xFF;
                    bytes[3] = (saddr >> 24) & 0xFF;  
                    struct timespec ts;
                    getnstimeofday(&ts);

                    printk("Domain length: %u\n", dom_length);
                    u_int activatedHTTPSFilter = (FILTER >> 1) & 0x1;

                    u_int written_bytes = 0;
                    written_bytes += snprintf(msg_buffer, 1024, "{\"src_ip\":\"%d.%d.%d.%d\"", bytes[3], bytes[2], bytes[1], bytes[0]);
                    written_bytes += snprintf(msg_buffer + written_bytes, 1024 - written_bytes, ",\"host\":\"");
                    //written_bytes += snprintf(msg_buffer + written_bytes, dom_length + 1 , tmp);
                    memcpy(msg_buffer + written_bytes, tmp, dom_length);

                    printk("Written atm: %u\n", written_bytes);
                    written_bytes += snprintf(msg_buffer + written_bytes + dom_length , 1024 - written_bytes , "\",\"method\":\"HTTPS\",\"ts\":%u,\"action\":%u}\n", ts.tv_sec, activatedHTTPSFilter);
                    printk("Written atm: %u\n", written_bytes);
                    msg_ptr = msg_buffer;

                    // Mirem si tenim el filtre HTTPS activat 
                    
                    return activatedHTTPSFilter ? NF_DROP : NF_ACCEPT;

                    //return NF_DROP;

                }

                begin_itx = delimiter_pos + 1;
            }


            // if (compareStrings(it + 9, "atenea.upc.edu", server_name_length)){
            //     printk("It is ATENEA!!\n");
            //     return NF_DROP;
            // }
        }



        it += length + 4;
    }
    return NF_ACCEPT;


}


int processTLSPacket(void *priv, struct sk_buff *skb, const struct nf_hook_state *state){
    

    unsigned char *user_data, *it, *tail;
    struct tcphdr *tcph;
    tcph = tcp_hdr(skb);

    user_data = (unsigned char *)((unsigned char *)tcph + (tcph->doff * 4));
    tail = skb_tail_pointer(skb);

    u_int payload_size = tail - user_data;

    

    if (payload_size == 0) return NF_ACCEPT;

    printk("We have to parse %u bytes!\n", payload_size);

   // printk("Hello from processTlsPacket! Have a nice panic kernel parsing this TLS message\n");

    u_char* first_byte = user_data;
    //printk("First Byte -> [%u]\n", *first_byte);

    if (*first_byte != 0x16) return NF_ACCEPT;

    // parse tls version

    uint16_t tls_version = (((*(first_byte + 1) & 0xF0) >> 4) * ( 16 * 16 * 16)) + (((*(first_byte + 1) & 0x0F)) * ( 16 * 16))\
                          + (((*(first_byte + 2) & 0xF0) >> 4) * (16)) + (((*(first_byte + 2) & 0x0F)));


    switch(tls_version){
        case 769:
            printk("TLS Version: TLS1.0\n");
            break;

        default:
            printk("TLS Version parsing: FAILED, accepting package\n");
            return NF_ACCEPT;


    }
    u_char* tls_length_p = first_byte + 3;

    uint16_t tls_length = (((*(tls_length_p) & 0xF0) >> 4) * ( 16 * 16 * 16)) + (((*(tls_length_p) & 0x0F)) * ( 16 * 16))\
                          + (((*(tls_length_p + 1) & 0xF0) >> 4) * (16)) + (((*(tls_length_p + 1) & 0x0F)));

    printk("TLS Length: %u\n", tls_length);

    u_int8_t handshake_version = *(tls_length_p + 2);

    printk("Handshake type: %u\n", handshake_version); 

    if (handshake_version != 0x01) return NF_ACCEPT;

    u_char* second_tls_version = tls_length_p + 6;
    printk("Second tls version: %u%u", *second_tls_version, *(second_tls_version + 1));

    u_char* session_id_length = second_tls_version + 34;

    u_char* cipher_suits_length = session_id_length + 1 + *(session_id_length);

    u_int number_of_cipher_suits = (((*(cipher_suits_length) & 0xF0) >> 4) * ( 16 * 16 * 16)) + (((*(cipher_suits_length) & 0x0F)) * ( 16 * 16))\
                          + (((*(cipher_suits_length + 1) & 0xF0) >> 4) * (16)) + (((*(cipher_suits_length + 1) & 0x0F)));

    printk("Number of cipher suits: %u\n", number_of_cipher_suits);


    u_char* compression_methods_length = cipher_suits_length + 2 +  (number_of_cipher_suits);
    printk("Compression methods length: %u\n", *compression_methods_length);

    u_char* extensions_length = compression_methods_length + 1 + *(compression_methods_length);

    u_int extensions_length_n = (((*(extensions_length) & 0xF0) >> 4) * ( 16 * 16 * 16)) + (((*(extensions_length) & 0x0F)) * ( 16 * 16))\
                          + (((*(extensions_length + 1) & 0xF0) >> 4) * (16)) + (((*(extensions_length + 1) & 0x0F)));

    printk("Extensions length n: %u\n", extensions_length_n);

    //TODO Parse exttensions
    int r = parseExtensions(extensions_length + 2, extensions_length_n, priv, skb, state);

    printk("ParseExtensions veridigm -> %u\n", r);

    

    return r;

}

unsigned int main_hook(void *priv,
			       struct sk_buff *skb,
			       const struct nf_hook_state *state)
{
    if (!skb) // Problema en la xarxa
        return NF_ACCEPT;


    struct ethhdr *eth;
    struct iphdr *ip_header;
    struct tcphdr *tcph;
    struct udphdr *udph;

    u32 saddr, daddr;
    u16 sport, dport;

    unsigned char *user_data, *it, *tail;

    eth = (struct ethhdr*)skb_mac_header(skb);
    ip_header = (struct iphdr *)skb_network_header(skb);    

    saddr = ntohl(ip_header->saddr);
    daddr = ntohl(ip_header->daddr);

    if (ip_header->protocol == IPPROTO_UDP){ // DNS-Check
        udph = udp_hdr(skb); 
        sport = ntohs(udph->source);
        dport = ntohs(udph->dest);

        if (dport == 53){
            u_int res = processUdpPacket(priv, skb, state); 
            return res;
           


            
        }
        return NF_ACCEPT;
    }
    else if (ip_header->protocol == IPPROTO_TCP){
        tcph = tcp_hdr(skb);
        sport = ntohs(tcph->source);
        dport = ntohs(tcph->dest);
    }

    if (dport == 443){
        return processTLSPacket(priv, skb, state);
        //return NF_ACCEPT;

    }
    

    if (dport != 80){
        return NF_ACCEPT;
    }
    printk("Hello\n");
    
    //return NF_ACCEPT;

    user_data = (unsigned char *)((unsigned char *)tcph + (tcph->doff * 4));
    tail = skb_tail_pointer(skb);

   // printk("%c%c%c%c", user_data[0], user_data[1], user_data[2], user_data[3]);

    u16 tcp_length = tail - user_data;
    //printk("%u", tcp_length);

    // Try to find \r\n, if not found then no Request Line is available -> Not an HTTP packet

    unsigned char* res;
    res = split_lines_http(user_data, tcp_length);
    if (res == NULL){
        return NF_ACCEPT;
    }

    // Request line is between [user_data-res]
    unsigned char* first_separation;

    for (it = user_data; it <= res - 1; ++it){
        if (*it == 0x20){
            first_separation = it;
            break;
        }
    }
    if (first_separation == NULL){
        return NF_ACCEPT;
    }

    unsigned char* method = kmalloc(sizeof(u_char) * ((first_separation - user_data) - 1), GFP_KERNEL);
    unsigned char* aux = method;

    //printk("[%u]", (res - user_data) );


    for (it = user_data; it < first_separation; ++it){
        *aux = *it;
        aux++;
    }

    /* COMPARE METHODS */
    if (compareStrings(method, "GET", 3)){
        printk("GET!\n");
    }
    else if (compareStrings(method, "HEAD", 4)){
        printk("HEAD!\n");
    }
    else if (compareStrings(method, "PUT", 3)){
        printk("PUT!\n");
    }
    else if (compareStrings(method, "POST", 4)){
        printk("POST!\n");
    }
    
    else if (compareStrings(method, "DELETE", 6)){
        printk("DELETE!\n");
    }
    else if (compareStrings(method, "CONNECT", 7)){
        printk("CONNECT!\n");
    }
    else if (compareStrings(method, "OPTIONS", 7)){
        printk("OPTIONS!\n");
    }
    else if (compareStrings(method, "TRACE", 5)){
        printk("TRACE!\n");
    }

    else if (compareStrings(method, "PATCH", 5)){
        printk("PATCH!");
    } else {
        //printk("HTTP Not recogniezed method\n");
        return NF_ACCEPT;
    }


   // return NF_ACCEPT;


    unsigned char* second_separation;
    for (it = first_separation + 1; it <= res; ++it){
        if (*it == 0x20){
            second_separation = it;
            break;
        }
    }
    if (second_separation == NULL){
        return NF_ACCEPT;
    }

    unsigned char* relative_uri = kmalloc(sizeof(u_char) * (second_separation  - first_separation - 1), GFP_KERNEL);
    aux = relative_uri;

    for (it = first_separation + 1; it < second_separation; ++it){
        *aux = *it;
        aux++;
    }

   // return NF_ACCEPT;


    int k;
    for (k=0;k<second_separation - first_separation - 1; ++k){
        printk(KERN_CONT "%c",  *(relative_uri + k));
    }
    printk("\n");

    // Headers start at res + 2;

    int r = processHeaders(res + 2, tcp_length - (res - user_data) - 2, priv, skb, state);

    // Release memory
    kvfree(method);
    kvfree(relative_uri);

    return r;
}

static struct nf_hook_ops my_nfho = {
    .hook              =       main_hook,
    .pf                =       PF_INET,      
    .hooknum           =       NF_INET_PRE_ROUTING,
    .priority          =       NF_IP_PRI_FIRST,
  //  .dev               =       "enp0s3"
};

/* Called when a process opens our device */
static int device_open(struct inode *inode, struct file *file) {
    /* If device is open, return busy */
    if (device_open_count) {
        return -EBUSY;
    }
    device_open_count++;
    try_module_get(THIS_MODULE);
    return 0;
}

/* This structure points to all of the device functions */
static struct file_operations file_ops = {
    .read = device_read,
    .write = device_write,
    .open = device_open,
    .release = device_release
};
/* When a process reads from our device, this gets called. */
static ssize_t device_read(struct file *flip, char *buffer, size_t len, loff_t *offset) {
    int bytes_read = 0;

    if (MODE_OF_OPERATION == 1){
        if (READ_POINTER != BANNED_DOMAINS){
            return 0;
        }
    }
    else if (MODE_OF_OPERATION == 2){
        if (msg_ptr != msg_buffer){ // Hem fet loop abans
            return 0;
        }
        READ_POINTER = msg_ptr;
    }
    else if (MODE_OF_OPERATION == 3){
        if (FILTER_READ == 0) return 0;
        READ_POINTER = &FILTER;
    }
    else {
        printk(KERN_ERR "Unknown method of operation in device_read\n");
        return -ENOEXEC;
    }
    /* Put data in the buffer */
    while (len && *READ_POINTER) {
        /* Buffer is in user data, not kernel, so you can’t just reference
        * with a pointer. The function put_user handles this for us */
        if (MODE_OF_OPERATION == 3){
            put_user(*(READ_POINTER++) + '0', buffer++);
        }
        else {
            put_user(*(READ_POINTER++), buffer++);
        }
        
        len--;
        bytes_read++;
    }
    
    if (MODE_OF_OPERATION == 2){
        msg_ptr = READ_POINTER;
    }
    if (MODE_OF_OPERATION == 3){
        FILTER_READ = 0;
    }    
    printk(KERN_CONT "Number of read bytes: %u\n", bytes_read);
    return bytes_read;
}
/* Called when a process tries to write to our device */
static ssize_t device_write(struct file *flip, const char *buffer, size_t len, loff_t *offset) {
    /* This is a read-only device */

    // Parse the buffer
    printk(KERN_INFO "device write(%p,%s,%d)", flip, buffer, len);

    u_int read_bytes = 0;
    if (len > 512){
        printk(KERN_ERR "Size too big\n");
        return -ENOEXEC;

    }

    printk(KERN_INFO "Length of text: %u\n", len);
        

    char* new_domains = kmalloc(sizeof(char) * len + 1, GFP_KERNEL);
    char* aux = new_domains;

    while (len){
        get_user(*(aux)++, buffer++);
       // buffer++;
       // aux++;
        len--;
        read_bytes++;
    }
    *aux = '\0';


    if (*new_domains == '1'){
        printk("Change of domains!\n");

        // Gotta copy new_domains to BANNED_DOMAINS
        memset(BANNED_DOMAINS, '\0', sizeof(BANNED_DOMAINS));
        strcpy(BANNED_DOMAINS, new_domains + 1);

        printk(KERN_INFO "Successfully copied data\n");

        printk("Your string %s\n", BANNED_DOMAINS);
    }
    else if (*new_domains == '2') {
        // Change mode of operation
        if (*(new_domains + 1) == '1'){
            MODE_OF_OPERATION = 1;
            READ_POINTER = BANNED_DOMAINS;
        }
        else if (*(new_domains + 1) == '2'){
            MODE_OF_OPERATION = 2;
            //READ_POINTER = msg_buffer;
        }
        else if (*(new_domains + 1) == '3'){ // SET FILTER
            u_int new_operation_filter = *(new_domains + 2);
            printk(KERN_INFO "Setting new filter: %u\n", new_operation_filter);
            FILTER = new_operation_filter - 48;
        }
        else if (*(new_domains + 1) == '4'){ // GET FILTER
            MODE_OF_OPERATION = 3;
            FILTER_READ = 1;
            
        }


        else {
            printk(KERN_ERR "Error, not a valid mode of operation.\n");
            return -ENOEXEC;
        }
    }
    
    else {
        printk(KERN_ERR "Unknown operation!\n");
        return -ENOEXEC;
    }



    printk("First value: %u, Second value: %u\n", *(new_domains), *(new_domains + 1));
    kvfree(new_domains);

    return read_bytes;
}

/* Called when a process closes our device */
static int device_release(struct inode *inode, struct file *file) {
    /* Decrement the open counter and usage count. Without this, the module would not unload. */
    device_open_count--;
    module_put(THIS_MODULE);
    return 0;
}
static int __init lkm_example_init(void) {
    /* Fill buffer with our message */
    strncpy(msg_buffer, EXAMPLE_MSG, MSG_BUFFER_LEN);

    /* Fill banned domains */
    memset(BANNED_DOMAINS, '\0', sizeof(BANNED_DOMAINS));
    strcpy(BANNED_DOMAINS, BANNED_DOMAINS_EXAMPLE);

    /* Set the msg_ptr to the buffer */
    msg_ptr = msg_buffer;
    READ_POINTER = MODE_OF_OPERATION == 1 ? BANNED_DOMAINS : msg_buffer;

    nf_register_net_hook(&init_net, &my_nfho);

    /* Try to register character device */
    major_num = register_chrdev(0, "tma_module", &file_ops);
    if (major_num < 0) {
        printk(KERN_ALERT "Could not register device: %d\n", major_num);
        return major_num;
    } else {
        // printk(KERN_INFO "lkm_example module loaded with device major number %d\n", major_num);
        // printk(KERN_INFO EXAMPLE_MSG);
        printk(KERN_INFO "I was assigned major number %d. To talk to\n", major_num);
        printk(KERN_INFO "the driver, create a dev file with\n");
        printk(KERN_INFO "'mknod /dev/%s c %d 0'.\n", DEVICE_NAME, major_num);
        printk(KERN_INFO "Try various minor numbers. Try to cat and echo to\n");
        printk(KERN_INFO "the device file.\n");
        printk(KERN_INFO "Remove the device file and module when done.\n");
        return 0;
    }
}
static void __exit lkm_example_exit(void) {
 /* Remember — we have to clean up after ourselves. Unregister the character device. */
    unregister_chrdev(major_num, DEVICE_NAME);
    printk(KERN_INFO "Goodbye, World!\n");
    nf_unregister_net_hook(&init_net, &my_nfho);
}
/* Register module functions */
module_init(lkm_example_init);
module_exit(lkm_example_exit);
