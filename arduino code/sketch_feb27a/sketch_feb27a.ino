#define RED_PIN 13
#define BLUE_PIN 12
#define GREEN_PIN 7
int joyX = A0;
int joyY = A1;
int potPin = A3;
int buzzerPin = 9;
int xValue;
int yValue;
int potValue;
int receivedData;
bool running = false;

void setup() {
  pinMode(buzzerPin, OUTPUT);
  pinMode(RED_PIN, OUTPUT);
  pinMode(BLUE_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  xValue = analogRead(joyX);
  yValue = analogRead(joyY);
  potValue = analogRead(potPin);

  receiveData();

  printRotation(potValue);
  checkXAxis(xValue);
  checkYAxis(yValue);


  if(xValue == 515 && yValue == 535){
    Serial.print("STOP");
    Serial.print("\n");
  }

  
  delay(250);

}

void receiveData() {
  
  while(Serial.available() > 0) {

    receivedData = Serial.parseInt();
    
    if(receivedData == 1){
      tone(buzzerPin,100);
      digitalWrite(RED_PIN,HIGH);
      delay(500);
      noTone(buzzerPin);
      digitalWrite(RED_PIN,LOW);
    }
    else if(receivedData == 2){
      tone(buzzerPin,100);
      digitalWrite(RED_PIN,HIGH);
      digitalWrite(BLUE_PIN,HIGH);
      digitalWrite(GREEN_PIN,HIGH);
      delay(333);
      digitalWrite(RED_PIN,LOW);
      digitalWrite(BLUE_PIN,LOW);
      digitalWrite(GREEN_PIN,LOW);
      delay(333);
      digitalWrite(RED_PIN,HIGH);
      digitalWrite(BLUE_PIN,HIGH);
      digitalWrite(GREEN_PIN,HIGH);
      delay(333);
      digitalWrite(RED_PIN,LOW);
      digitalWrite(BLUE_PIN,LOW);
      digitalWrite(GREEN_PIN,LOW);
      noTone(buzzerPin);
    }
    else if(receivedData == 3){
      tone(buzzerPin,100);
      digitalWrite(BLUE_PIN,HIGH);
      delay(500);
      noTone(buzzerPin);
      digitalWrite(BLUE_PIN,LOW);
    }
    else{
      tone(buzzerPin,100);
      digitalWrite(GREEN_PIN,HIGH);
      delay(333);
      digitalWrite(GREEN_PIN,LOW);
      delay(333);
      digitalWrite(GREEN_PIN,HIGH);
      delay(333);
      digitalWrite(GREEN_PIN,LOW);
      delay(333);
      digitalWrite(GREEN_PIN,HIGH);
      delay(333);
      digitalWrite(GREEN_PIN,LOW);
      noTone(buzzerPin);
    }


  }
}

void printRotation(int potValue){
  Serial.print("rotation ");
  Serial.print(potValue * 0.36);
  Serial.print("\n");

}

void checkXAxis(int xValue){
  if(xValue > 540){
    Serial.print("UP");
    Serial.print("\n");
  }
  
  if(xValue < 490){
    Serial.print("DOWN");
    Serial.print("\n");
  }
}

void checkYAxis(int yValue){
    if(yValue > 560){
    Serial.print("RIGHT");
    Serial.print("\n");
  }

  if(yValue < 510){
    Serial.print("LEFT");
    Serial.print("\n");
  }
}
