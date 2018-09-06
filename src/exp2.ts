

export abstract class ActionListener {
  
  constructor(f: any) {
    this.actionPerformed = f;
  }
  
  abstract actionPerformed(input: string): string;
  
}


new class implements ActionListener {
  actionPerformed(input: string): string {
    return "Hello"
  }
};
