import os, sys, re

def process_directories():
    fileout = ""

    directory = os.path.dirname(os.path.realpath(os.getcwd()))
    for subdir, dirs, files in os.walk(directory):
        if "travis" in subdir:
            for filename in files:
                regex = re.compile(r'\d+')
                result = regex.findall(filename)[0]
                number = str(result).zfill(3)

                if "correct" in subdir:

                    if "MIPS" in subdir:
                        fileout = "test-mips-"
                    else:
                        fileout = "test-riscv-"
                else:
                    if "MIPS" in subdir:
                        fileout = "testerror-mips-"
                    else:
                        fileout = "testerror-riscv-"

                if ".output" in filename:
                    fileout = fileout + number + ".out"
                elif ".txt" in filename:
                    fileout = fileout + number + ".s"
                else:
                    fileout = fileout + number + ".s"

                subdirectoryPath = os.path.relpath(subdir, directory)  # path to subdirectory
                filePath = os.path.join(subdirectoryPath, filename)  # path to file
                newFilePath = os.path.join(subdirectoryPath, fileout)  # new path
                os.rename("../" + filePath, "../" + newFilePath)


process_directories()