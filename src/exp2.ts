

export abstract class ActionListener {
  
  abstract actionPerformed(input: string): string;
  
}


const v = new class implements ActionListener {
  actionPerformed(input: string): string {
    return "Hello"
  }
};

