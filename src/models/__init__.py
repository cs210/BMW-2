import sys

from .cnn import BasicCNN
from .cnn_lstm import CnnLSTM

def get_model_initializer(model_name):
    ''' Retrieves class initializer from its string name. '''
    return getattr(sys.modules[__name__], model_name)
