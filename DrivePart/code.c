#include<string.h>
#include<stdlib.h>

int main(int argc, char **argv) {

char *buf;
int card_id = 21231313;
//int a ;
//int z = 3;


buf = (char *)malloc(sizeof(char)*BUFSIZE);

strcpy(buf, "This_is_dummy_string_This_is_dummy_string_This_is_dummy_string_This_is_dummy_string_This_is_dummy_string_This_is_dummy_string_This_is_dummy_string_");
card_id_method(&card_id);

//funct(&a,&z);
printf("%s", buf);

}


void card_id_method(void *card_id)
{
char *card_id1 = card_id;
printf("%c",*card_id1);
/*if(z==1)
printf("%d",*(int*)a); // If user inputs 1, then he means the data is an integer and type casting is done accordingly.
else if(z==2)
printf("%c",*(char*)a); // Typecasting for character pointer.
else if(z==3)
printf("%f",*(float*)a); // Typecasting for float pointer
*/
}
