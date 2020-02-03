#!/usr/bin/env python
import sys,os,string,traceback,pprint
from threading import Thread


'''
obj_parser.py has two arguments: the obj file containing the geometry and the mtl file containing the materials (optional)

In the Wavefront OBJ format, the indices are shared among objects.

'''

MATERIALS = {}  #dictionary for materials
OBJECTS = {}

FILE = ''

def createWebGLFile():
    mf = open('manifest.txt','w')
    mf.write('original OBJ file: ' + FILE +'\n')
    print('\n=== WebGL Output ===')
    partNumber = 1

    nor = OBJECTS['normals']
    txt = OBJECTS['texture_coords']

    for obj in OBJECTS:
        if obj == 'normals':
            continue
        if obj == 'texture_coords':
            continue

        ver = OBJECTS[obj]['vertices']

        allIndicesForObject = []

        if (len(OBJECTS[obj]['group']) > 0):
#             print(OBJECTS[obj]['group'])
            for grp in OBJECTS[obj]['group']:                                   # The idea here is to get the minimum index per object
                allIndicesForObject += OBJECTS[obj]['group'][grp]['indices']    # so the indices of every group belonging to the same object
        else:
#             print(OBJECTS[obj])
#             print(OBJECTS[obj]['indices'])
            allIndicesForObject += OBJECTS[obj]['indices']    # so the indices of every group belonging to the same object


        if len(allIndicesForObject) == 0:
            print('Warning: the object ' + obj + ' will not generate a JSON file as it has no groups')
            continue
        minIndex = min(allIndicesForObject)                                 # can be reindexed (starting on zero per group) for WebGL

        try:
            os.makedirs('json')
        except OSError as e:
            if (e.args[1] != 'File exists'):
                print(e.args)
                raise

        if (len(OBJECTS[obj]['group']) > 0):
            for grp in OBJECTS[obj]['group']:
                ind = OBJECTS[obj]['group'][grp]['indices']
                normals_idx = OBJECTS[obj]['group'][grp]['normals_idx']
                texture_idx = OBJECTS[obj]['group'][grp]['texture_idx']

                numIndices = len(ind)
                numVertices = len(ver)
                numTextureCoords = len(txt)
                numIndNormals = len(normals_idx)
                numTextureIdx = len(texture_idx)

                print('Writing file part'+ str(partNumber)+'.json > [ alias: '+grp+' vertices:' + str(numVertices/3) + ', indices: ' + str(numIndices) +']')
                mf.write('part'+ str(partNumber)+'.json > alias: '+grp+'\n')
                f = open('json/part'+str(partNumber)+'.json','w')

                partNumber +=1
                f.write('{\n')
                f.write('  "alias" : "'+grp+'",\n')                 # ALIAS

                f.write('  "vertices" : [')                         # VERTICES
                for v in ver[0:numVertices-1]:
                    f.write(str(v)+',')
                f.write(str(ver[numVertices-1])+'],\n')

                f.write('  "indices" : [')                          # INDICES

                for i in ind[0:numIndices-1]:
                    f.write(str(i-minIndex)+',')
                f.write(str(ind[numIndices-1]-minIndex)+'],\n')

                f.write('  "normals" : [')

                for j in normals_idx[0:numIndNormals-1]:
                    jk = 3 * (j-1)
                    f.write(str(nor[jk])+','+str(nor[jk+1])+','+str(nor[jk+2])+',')
                jk = 3 * (normals_idx[numIndNormals-1]-1)
                f.write(str(nor[jk])+','+str(nor[jk+1])+','+str(nor[jk+2])+'],\n')

                f.write('  "texture_coords" : [')                   # TextureCoords

                for j in texture_idx[0:numTextureIdx-1]:
                    jk = 2 * (j-1)
                    f.write(str(txt[jk])+','+str(txt[jk+1])+',')
                jk = 2 * (texture_idx[numTextureIdx-1]-1)
                f.write(str(txt[jk])+','+str(txt[jk+1])+'],\n')

                useMat = OBJECTS[obj]['group'][grp]['material']     # MATERIALS
                #print(' group ' +grp+' uses mat = ' + useMat)
                if useMat == '(null)' or len(useMat) == 0:
                    print('warning: the group '+grp+' does not have materials')
                    continue
                mat = MATERIALS[useMat]
                numKeys = len(mat)
                currKey = 1
                for key in mat:
                    f.write('  "'+key+'" : ')
                    if type(mat[key]) is float:
                        f.write("%.5f" % mat[key])
                    elif type(mat[key]) is int:
                        f.write(str(mat[key]))
                    else:
                        numNum = len(mat[key])
                        currNum = 1
                        f.write('[')
                        for num in mat[key]:
                            s = "%.5f" % num
                            f.write(s)
                            if currNum < numNum:
                                f.write(',')
                            currNum +=1
                        f.write(']')

                    if (currKey < numKeys):
                        f.write(',\n')
                    else:
                        f.write('\n')
                    currKey+=1

                f.write('}')
                f.close()

#         elif (len(OBJECTS[obj]['indices']) > 0):
#             print(obj)
#             ind = OBJECTS[obj]['indices']
#             normals_idx = OBJECTS[obj]['normals_idx']
#
#             numIndices = len(ind)
#             numVertices = len(ver)
#             numIndNormals = len(normals_idx)
#
#             print('Writing file part'+ str(partNumber)+'.json > [ alias: '+ obj +' vertices:' + str(numVertices/3) + ', indices: ' + str(numIndices) +']')
#             mf.write('part'+ str(partNumber)+'.json > alias: '+ obj +'\n')
#             f = open('json/part'+str(partNumber)+'.json','w')
#
#             partNumber +=1
#             f.write('{\n')
#             f.write('  "alias" : "'+ obj +'",\n')                 # ALIAS
#
#             f.write('  "vertices" : [')                         # VERTICES
#             for v in ver[0:numVertices-1]:
#                 f.write(str(v)+',')
#             f.write(str(ver[numVertices-1])+'],\n')
#
#             f.write('  "indices" : [')                          # INDICES
#
#             for i in ind[0:numIndices-1]:
#                 f.write(str(i-minIndex)+',')
#             f.write(str(ind[numIndices-1]-minIndex)+'],\n')
#
#             #f.write('  "normals" : [')
#
#             #for j in normals_idx[0:numIndNormals-1]:
#             #    jk = 3 * (j-1)
#             #    f.write(str(nor[jk])+','+str(nor[jk+1])+','+str(nor[jk+2])+',')
#             #jk = 3 * (normals_idx[numIndNormals-1]-1)
#             #f.write(str(nor[jk])+','+str(nor[jk+1])+','+str(nor[jk+2])+'],\n')
#
#             useMat = OBJECTS[obj]['material']     # MATERIALS
#             #print(' object ' + obj +' uses mat = ' + useMat)
#             if useMat == '(null)' or len(useMat) == 0:
#                 print('warning: the group '+ obj +' does not have materials')
#                 continue
#             mat = MATERIALS[useMat]
#             numKeys = len(mat)
#             currKey = 1
#             for key in mat:
#                 f.write('  "'+key+'" : ')
#                 if type(mat[key]) is float:
#                     f.write("%.5f" % mat[key])
#                 elif type(mat[key]) is int:
#                     f.write(str(mat[key]))
#                 else:
#                     numNum = len(mat[key])
#                     currNum = 1
#                     f.write('[')
#                     for num in mat[key]:
#                         s = "%.5f" % num
#                         f.write(s)
#                         if currNum < numNum:
#                             f.write(',')
#                         currNum +=1
#                     f.write(']')
#
#                 if (currKey < numKeys):
#                     f.write(',\n')
#                 else:
#                     f.write('\n')
#                 currKey+=1
#
#             f.write('}')
#             f.close()
    mf.close()

def parseGeometry(file, hasMaterials):
    print('\n=== Geometry ===')
    LOC_NOWHERE = 0
    LOC_OBJECT = 1
    LOC_GROUP = 2

    location = LOC_NOWHERE

    vertices    = []
    indices     = []
    normals     = []
    normals_idx = []
    scalars     = []
    texture_coords = []
    texture_idx = []
    material    = {}

    nLine = 0

    OBJECT_NAME = ''
    GROUP_NAME = ''
    MATERIAL_NAME = ''

    OBJECTS['normals'] = []
    OBJECTS['texture_coords'] = []

    for line in open(file, 'r').readlines():
        nLine = nLine + 1
        try:
            if line.startswith('usemtl') and hasMaterials:            #there is a material definition file associated .mtl (second argument on cmd line)
                    words = line.split()
                    if (len(words) == 2):
                        MATERIAL_NAME = words[1]
                    else:
                        MATERIAL_NAME = 'undefined'
                    if (GROUP_NAME):
                        OBJECTS[OBJECT_NAME]['group'][GROUP_NAME]['material'] = MATERIAL_NAME
                        print(OBJECTS[OBJECT_NAME]['group'][GROUP_NAME]['material'])
                    else :
                        OBJECTS[OBJECT_NAME]['material'] = MATERIAL_NAME
                        print(OBJECTS[OBJECT_NAME]['material'])

            elif line.startswith('o '):                                       #Processing an new object
                OBJECT_NAME = line.split()[1]
                location = LOC_OBJECT

                OBJECTS[OBJECT_NAME] = {}
                OBJECTS[OBJECT_NAME]['group']    = {}
                OBJECTS[OBJECT_NAME]['vertices'] = []
                OBJECTS[OBJECT_NAME]['indices']        = []
                OBJECTS[OBJECT_NAME]['normals_idx']    = []
                OBJECTS[OBJECT_NAME]['texture_idx']    = []

                normals = OBJECTS['normals']                #aliasing
                texture_coords = OBJECTS['texture_coords']  #aliasing

                vertices = OBJECTS[OBJECT_NAME]['vertices'] #aliasing
                indices = OBJECTS[OBJECT_NAME]['indices']          #aliasing so we can store here
                normals_idx = OBJECTS[OBJECT_NAME]['normals_idx']    #aliasing so we can store here
                texture_idx = OBJECTS[OBJECT_NAME]['texture_idx']    #aliasing so we can store here

                print('\nObject: ' + OBJECT_NAME)

            elif line.startswith('g '):                                     #Processing a new group
                GROUP_NAME = line.split()[1]
                location = LOC_GROUP

                OBJECTS[OBJECT_NAME]['group']    = {}
                OBJECTS[OBJECT_NAME]['group'][GROUP_NAME]                   = {}
                OBJECTS[OBJECT_NAME]['group'][GROUP_NAME]['indices']        = []
                OBJECTS[OBJECT_NAME]['group'][GROUP_NAME]['normals_idx']    = []
                OBJECTS[OBJECT_NAME]['group'][GROUP_NAME]['texture_idx']    = []
                indices     = OBJECTS[OBJECT_NAME]['group'][GROUP_NAME]['indices']          #aliasing so we can store here
                normals_idx = OBJECTS[OBJECT_NAME]['group'][GROUP_NAME]['normals_idx']    #aliasing so we can store here
                texture_idx = OBJECTS[OBJECT_NAME]['group'][GROUP_NAME]['texture_idx']    #aliasing so we can store here

                print('\tGroup: ' + GROUP_NAME)

            elif location == LOC_GROUP:                                     #Add indices to current group
                if line.startswith('f '):
                    f = line[1:len(line)].split()
                    pl = len(f)
                    if (pl == 3):                                         #ideal case for WebGL: all faces are triangles
                        fa = int(f[0][0:f[0].find('/')])
                        fb = int(f[1][0:f[1].find('/')])
                        fc = int(f[2][0:f[2].find('/')])
                        indices.append(fa)
                        indices.append(fb)
                        indices.append(fc)
                        ta = int(f[0][f[0].find('/')+1:f[0].rfind('/')])
                        tb = int(f[1][f[1].find('/')+1:f[1].rfind('/')])
                        tc = int(f[2][f[2].find('/')+1:f[2].rfind('/')])
                        texture_idx.append(ta)
                        texture_idx.append(tb)
                        texture_idx.append(tc)
                        na = int(f[0][f[0].rfind('/')+1:len(f[0])])
                        nb = int(f[1][f[1].rfind('/')+1:len(f[1])])
                        nc = int(f[2][f[2].rfind('/')+1:len(f[2])])
                        normals_idx.append(na)
                        normals_idx.append(nb)
                        normals_idx.append(nc)
                    else:
                        print('faces need to be triangular')
                        raise

            elif location == LOC_OBJECT:
                if line.startswith('f '):                           #Add indices to current object
                    f = line[1:len(line)].split()
                    pl = len(f)
                    if (pl == 3):                                   #ideal case for WebGL: all faces are triangles
                        fa = int(f[0][0:f[0].find('/')])
                        fb = int(f[1][0:f[1].find('/')])
                        fc = int(f[2][0:f[2].find('/')])
                        indices.append(fa)
                        indices.append(fb)
                        indices.append(fc)
                        ta = int(f[0][f[0].find('/')+1:f[0].rfind('/')])
                        tb = int(f[1][f[1].find('/')+1:f[1].rfind('/')])
                        tc = int(f[2][f[2].find('/')+1:f[2].rfind('/')])
                        texture_idx.append(ta)
                        texture_idx.append(tb)
                        texture_idx.append(tc)
                        na = int(f[0][f[0].rfind('/')+1:len(f[0])])
                        nb = int(f[1][f[1].rfind('/')+1:len(f[1])])
                        nc = int(f[2][f[2].rfind('/')+1:len(f[2])])
                        normals_idx.append(na)
                        normals_idx.append(nb)
                        normals_idx.append(nc)
                    else:
                        print('faces need to be triangular')

                if line.startswith('v '):                            #Add vertices to current object
                    for v in line[1:len(line)].split():
                        vertices.append(float(v))

                if line.startswith('vt '):                           #Add normals to current object
                    texture_line = line[3:len(line)].split()
                    #print(texture_line)
                    for vt in texture_line:
                        texture_coords.append(float(vt))

                if line.startswith('vn '):                           #Add normals to current object
                    for vn in line[3:len(line)].split():
                        normals.append(float(vn))


        except:
            print('ERROR while processing line:  '+str(nLine))
            print(line)
            raise
    #pp = pprint.PrettyPrinter(indent=2, width=300)
    #pp.pprint(OBJECTS)

def parseMaterials(file):
    if (len(file) == 0):
        return False
    print('\n=== Materials ===')
    linenumber = 0
    currentMaterial = ''
    for line in open(file, 'r').readlines():
        linenumber = linenumber + 1
        try:
            if line.startswith('newmtl'):
                words = line.split()
                if (len(words) == 2):
                    currentMaterial = words[1]
                else:
                    currentMaterial = 'undefined'
                print('Material: ' + currentMaterial)
                MATERIALS[currentMaterial] = {}
            elif line.startswith('illum'):
                words = line.split()
                MATERIALS[currentMaterial][words[0]] = int(words[1])
            elif line.startswith('Ns') or line.startswith('Ni') or line.startswith('d'):
                words = line.split()
                MATERIALS[currentMaterial][words[0]] = float(words[1])
            elif line.startswith('Ka') or line.startswith('Kd') or line.startswith('Ks'):
                words = line.split()
                MATERIALS[currentMaterial][words[0]] = [float(words[1]), float(words[2]), float(words[3])]
            continue
        except:
            print('Error while processing line '+str(linenumber))
            print(line)
            raise
    return True


if __name__ == '__main__':
   if (len(sys.argv) == 1):
        print('ERROR -- Use like this: obj_parser.py objfile.obj mtlfile.mtl')
        sys.exit(0)
   FILE = sys.argv[1]
   hasMaterials = parseMaterials(sys.argv[2])
   parseGeometry(FILE, hasMaterials)
   dir = os.path.dirname(FILE)
   os.chdir(dir)
   createWebGLFile()
