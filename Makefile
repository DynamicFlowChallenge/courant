# include arch.mk

FILE ?= tests/testfiles/test.crt
GRAMMAR = Courant.g4
ANTLRJAR=/usr/share/java/antlr-4.13.2-complete.jar
ANTLR=antlr4

.PHONY: gui clean

gui:
	@mkdir -p generated build
	$(ANTLR) -Dlanguage=Java -o generated -Xexact-output-dir $(GRAMMAR)
	javac -cp $(ANTLRJAR) -d build generated/*.java
	java -cp $(ANTLRJAR):build org.antlr.v4.gui.TestRig Courant prog -gui $(FILE)

clean:
	rm -rf generated build

